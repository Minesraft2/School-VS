import React, { createContext, useContext, useEffect, useState } from "react";

import { auth, db } from '../firebase';
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState();
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(true);

    async function signup(email, password, displayName) {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        cred.user?.updateProfile({ displayName });
        db.collection('userdata').doc(cred.user.uid).set({
            username: displayName,
            "gam-bits": 5000,
            team: Math.round(Math.random()),
            createdAt: new Date(Date.now())
        });
        return cred;
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logout() {
        return auth.signOut()
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    function updateEmail(email) {
        return currentUser.updateEmail(email);
    }

    function updatePassword(password) {
        return currentUser.updatePassword(password);
    }

    async function updateUsername(displayName) {
        await updateUserData({ username: displayName });
        return currentUser.updateProfile({ displayName });
    }/* 

    async function getUserData(uid) {
        let snapshot = await db.collection('userdata').doc(uid).get();
        if (!snapshot.exists) await db.collection('userdata').doc(uid).set({ "gam-bits": 5000, team: Math.round(Math.random()) });
        snapshot = await db.collection('userdata').doc(uid).get();
        window.test = [db.collection('userdata'), snapshot];
        return snapshot.data();
    } */

    async function getUserData(uid) {
        let snapshot = await db.collection('userdata').doc(uid).get();
        if (!snapshot.exists) db.collection('userdata').doc(uid).set({ username: auth.currentUser.displayName, "gam-bits": 5000, team: Math.round(Math.random()), createdAt: new Date(Date.now()) });
        snapshot = await db.collection('userdata').doc(uid).get();
        return snapshot.data();
    }

    function updateUserData(data) {
        return db.collection('userdata').doc(uid).update(data);
    }

    async function getAllUsers() {
        const snapshot = await db.collection('userdata').get();
        return snapshot.docs.map(doc => doc.data());
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log("Logged In:", String(user != null));
            setCurrentUser(user);
            setLoading(false);
            if (user != null) getUserData(user.uid).then(setUserData);
        });
        window.db = db;
        window.auth = auth;
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, userData, login, signup, logout, resetPassword, updateEmail, updatePassword, updateUsername, getUserData, updateUserData, getAllUsers }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}