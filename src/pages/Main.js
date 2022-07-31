import React, { useEffect } from "react";
import Nav from "../Nav";
import { useAuth } from "../context/AuthContext";
import "./Main.css";
import { TEAMS, relatime } from "./Leaderboard";
const Home = (props) => {
    const { currentUser, userData } = useAuth();
    return (<>
        <Nav />
        <div className="profile">
            <h1>Profile</h1>
            <span>Joined {relatime((userData?.createdAt.seconds || 0) * 1000 - Date.now())}</span>
            <div className="divider"></div>
            <div className="profileContent">
                <strong style={{ fontSize: "1.5rem" }}>{currentUser.displayName}</strong>
                <div className="userData">
                    <span>Gam-Bits: {userData?.gam_bits}</span>
                    <span>Team: {TEAMS[userData?.team]}</span>
                </div>
            </div>
        </div>
    </>)
}
export default Home;