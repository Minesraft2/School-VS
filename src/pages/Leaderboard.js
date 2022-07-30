import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    const [sort, setSort] = useState('');
    const [page, setPage] = useState(1);

    const { currentUser, getAllUsers } = useAuth();
    const [params, setParams] = useSearchParams();

    const navigate = useNavigate();

    useEffect(() => {
        const fakeUsers = new Array(50 - 3).fill(0).map(() => ({ username: Math.random().toFixed(9).slice(2, 9).split('').map(x => String.fromCharCode("a".charCodeAt(0) + parseInt(x))).join(''), "gam-bits": Math.floor(Math.random() * 6000), team: Math.round(Math.random()), createdAt: { seconds: (Date.now() / 1000) - Math.floor(Math.random() * 2628000) } })); // create 50 (minus 3 real current users) fake users
        getAllUsers() // grab the user database
            .then(x => x
                .concat(fakeUsers) // add fake users to list for some scroll space
                .sort(({ "gam-bits": gambitsA }, { "gam-bits": gambitsB }) => gambitsB - gambitsA) // sort list by amount of bits they have
                .map((x, i) => ({ ...x, rank: i + 1 })) // give each user a rank based on their place in the list
            ).then(setUsers); // set users state to list
    }, []);

    useEffect(() => {
        switch (sort) {
            case "createdAt": setUsers([...users.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)]); break;
            case "rank": setUsers([...users.sort((a, b) => b["gam-bits"] - a["gam-bits"])]); break;
            case "username": setUsers([...users.sort((a, b) => a.username.toLowerCase() < b.username.toLowerCase() ? -1 : a.username.toLowerCase() > b.username.toLowerCase() ? 1 : 0)]); break;
            default: setUsers([...users.sort((a, b) => b[sort] - a[sort])]);
        }
    }, [sort]);

    const handleSort = (Sort) => {
        if (Sort == sort) setUsers([...users.reverse()]);
        else setSort(Sort);
    }
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
                            <div onClick={() => navigate(params.get('filter') === TEAMS[team].toLowerCase() ? `` : `?filter=${TEAMS[team].toLowerCase()}`)} className={`team${winning ? " winning" : ''}`} key={team}>
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
                            <th onClick={() => handleSort('rank')}>
                                <span className="sortTooltip">Sort by Rank</span>
                                Rank
                            </th>
                            <th onClick={() => handleSort('username')}>
                                <span className="sortTooltip">Sort by Username</span>
                                Username
                            </th>
                            <th onClick={() => handleSort('gam-bits')}>
                                <span className="sortTooltip">Sort by Gam-Bits</span>
                                Gam-Bits
                            </th>
                            <th>Team</th>
                            <th onClick={() => handleSort('createdAt')}>
                                <span className="sortTooltip">Sort by Joined</span>
                                Joined
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.filter(({ team }) => {
                                return params.get('filter') ? TEAMS[team] == TEAMS.find(x => x.toLowerCase() == params.get('filter')) : true
                            }).slice(0, 15 * page).map(({ username, "gam-bits": gambits, team, createdAt: { seconds }, rank }) => {
                                return (
                                    <tr className={username == currentUser.displayName ? "active" : ''} key={rank}>
                                        <td>{rank}</td>
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