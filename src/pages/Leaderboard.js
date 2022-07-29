import React, { useEffect, useState } from "react";
import Nav from "../Nav";
import { useAuth } from "../context/AuthContext";
import "./leaderboard.css";
const TEAMS = ["Springs", "Ranch"];
const UNITS = [
    ["year", 31536000000],
    ["month", 2628000000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
];

const rtf = new Intl.RelativeTimeFormat("en", { style: "long" });
const relatime = (elapsed) => {
    for (const [unit, amount] of UNITS) if (Math.abs(elapsed) > amount || unit === "second") return rtf.format(Math.round(elapsed / amount), unit);
};
const Leaderboard = (props) => {
    const [users, setUsers] = useState([]);
    const { currentUser, getAllUsers } = useAuth();
    console.log(currentUser, getAllUsers());
    useEffect(() => {
        getAllUsers().then(x => setUsers(x.concat(new Array(20).fill(0).map(() => ({ username: Math.random().toFixed(9).slice(2, 9).split('').map(x => String.fromCharCode("a".charCodeAt(0) + parseInt(x))).join(''), "gam-bits": Math.floor(Math.random() * 6000), team: Math.round(Math.random()), createdAt: { seconds: (Date.now() / 1000) - Math.floor(Math.random() * 2628000) } })))));
    }, []);
    return (
        <>
            <Nav {...props} />
            <h1 className="big">Leaderboard</h1>
            <div>
                {
                    [0, 1].map((team) => {
                        const totalBits = users.filter(x => x.team == team).map(x => x['gam-bits']).reduce((a, b) => a + b, 0);
                        const winning = users.filter(x => x.team != team).map(x => x['gam-bits']).reduce((a, b) => a + b, 0) < totalBits;
                        return (
                            <div className={`team${winning ? " winning" : ''}`} key={team}>
                                <h2>{TEAMS[team]}</h2>
                                <span className="totalBits">{totalBits}</span>
                            </div>
                        );
                    })
                }
            </div>
            <div className="leaderboardWrapper">
                <table className="leaderboard">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Gam-Bits</th>
                            <th>Team</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.sort(({ "gam-bits": gambitsA }, { "gam-bits": gambitsB }) => gambitsB - gambitsA).map(({ username, "gam-bits": gambits, team, createdAt: { seconds } }, index) => {
                                return (
                                    index <= 14 &&
                                    <tr className={username == currentUser.displayName ? "active" : ''} key={index}>
                                        <td>{index + 1}</td>
                                        <td>{username}</td>
                                        <td>{gambits}</td>
                                        <td>{TEAMS[team]}</td>
                                        <td>{relatime(seconds * 1000 - Date.now())}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default Leaderboard;