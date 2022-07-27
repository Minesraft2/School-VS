import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const app = firebase.initializeApp({
    apiKey: "AIzaSyDsbF47bXhbXjDnf2wTOFmHV1zFlfVIfgM",
    authDomain: "gimit-auth-dev.firebaseapp.com",
    databaseURL: "https://gimit-auth-dev.firebaseapp.com",
    projectId: "gimit-auth-dev",
    storageBucket: "gimit-auth-dev.appspot.com",
    messagingSenderId: "962753319398",
    appId: "1:962753319398:web:f5efc7aca3b62a0f198627",
});

export const auth = app.auth();
export const db = app.firestore();
export default app;