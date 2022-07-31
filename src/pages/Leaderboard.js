import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Nav from "../Nav";
import { useAuth } from "../context/AuthContext";
import "./leaderboard.css";
export const TEAMS = ["Springs", "Ranch"];

export const relatime = (elapsed) => {
    const UNITS = [
        ["year", 31536000000],
        ["month", 2628000000],
        ["day", 86400000],
        ["hour", 3600000],
        ["minute", 60000],
        ["second", 1000],
    ];
    const rtf = new Intl.RelativeTimeFormat("en", { style: "long" });
    for (const [unit, amount] of UNITS) if (Math.abs(elapsed) > amount || unit === "second") return rtf.format(Math.round(elapsed / amount), unit);
};
const fakeUsers = new Array(50 - 3).fill(0).map(() => ({ username: Math.random().toFixed(9).slice(2, 9).split('').map(x => String.fromCharCode("a".charCodeAt(0) + parseInt(x))).join(''), gam_bits: Math.floor(Math.random() * 6000), team: Math.round(Math.random()), createdAt: { seconds: (Date.now() / 1000) - Math.floor(Math.random() * 2628000) } })); // create 50 (minus 3 real current users) fake users
const Leaderboard = (props) => {
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [sort, setSort] = useState('');
    const [page, setPage] = useState(1);

    const { currentUser, getAllUsers } = useAuth();
    const [params, setParams] = useSearchParams();

    const navigate = useNavigate();

    useEffect(() => {
        getAllUsers() // grab the user database
            .then(users => setAllUsers(users
                .concat(fakeUsers) // add fake users to list for some scroll space
                .sort(({ gam_bits: gambitsA }, { gam_bits: gambitsB }) => gambitsB - gambitsA) // sort list by amount of bits they have
                .map((x, i) => ({ ...x, rank: i + 1 })) // give each user a rank based on their place in the list
            )) // set users state to list
    }, []);

    useEffect(() => {
        setUsers(allUsers.filter(({ team }) => params.get('filter') ? TEAMS[team] == TEAMS.find(x => x.toLowerCase() == params.get('filter')) : true)); // filter by team
        setPage(1); // Reset page
    }, [params.get('filter'), allUsers]);

    useEffect(() => {
        switch (sort) {
            case "createdAt": setUsers([...users.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)]); break;
            case "rank": setUsers([...users.sort((a, b) => b.gam_bits - a.gam_bits)]); break;
            case "username": setUsers([...users.sort((a, b) => a.username.toLowerCase() < b.username.toLowerCase() ? -1 : a.username.toLowerCase() > b.username.toLowerCase() ? 1 : 0)]); break;
            default: setUsers([...users.sort((a, b) => b[sort] - a[sort])]);
        }
        setPage(1);
    }, [sort]);

    const handleSort = (Sort) => {
        if (Sort == sort) setUsers([...users.reverse()]);
        else setSort(Sort);
    }

    window.page = () => setPage(oldPage => Math.min(oldPage + 1, Math.ceil(allUsers.length / 15)));
    window.getPage = () => page;
    return (
        <>
            <Nav {...props} />
            <h1 className="big">Leaderboard</h1>
            <div>
                {
                    [0, 1].map((team) => {
                        const totalBits = allUsers.filter(x => x.team == team).map(x => x.gam_bits).reduce((a, b) => a + b, 0);
                        const winning = allUsers.filter(x => x.team != team).map(x => x.gam_bits).reduce((a, b) => a + b, 0) < totalBits;
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
                            <th onClick={() => handleSort('gam_bits')}>
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
                            users.slice(0, 15 * page).map(({ username, gam_bits, team, createdAt: { seconds }, rank }) => {
                                return (
                                    <tr className={username == currentUser.displayName ? "active" : ''} key={rank}>
                                        <td>{rank}</td>
                                        <td>{username}</td>
                                        <td>{gam_bits}</td>
                                        <td>{TEAMS[team]}</td>
                                        <td>{relatime(seconds * 1000 - Date.now())}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                {
                    page < Math.ceil(users.length / 15) && <div onClick={() => setPage(oldPage => Math.min(oldPage + 1, Math.ceil(users.length / 15)))} key="loadMore" className="loadUsers">
                        Load more users
                    </div>
                }
            </div>
        </>
    )
}
export default Leaderboard;