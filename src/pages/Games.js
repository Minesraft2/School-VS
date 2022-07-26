import React from "react";
import Blackjack from "./games/Blackjack";
import Chess from "./games/Chess";
import Uno from "./games/Uno"
import { Link, useParams, Routes, Route, useMatch, Outlet } from "react-router-dom";
import Nav from "../Nav";

export const GAMES = {
    blackjack: {
        component: Blackjack,
        name: "Blackjack",
        aliases: ["21"],
        tags: ["card", "gambling", "blackjack"],
        icon: "./icons/blackjack.png"
    },
    chess: {
        component: Chess,
        name: "Chess",
        aliases: [],
        tags: ["chess", "strategy"],
        icon: "./icons/chess.png"
    },
    uno: {
        component: Uno,
        name: "Uno",
        aliases: [],
        tags: ["uno"],
        icon: "./icons/uno.png"
    }
}
const Games = (props) => {
    const { id } = useParams();
    var content;
    /* return (
        id
    ) */
    return (
        <>
            <Nav {...props} />
            <Routes>
                <Route path="/" element={<div className="gameContainer">
                    {Object.entries(GAMES).map(([key, value]) =>
                        <Link key={key} to={`/games/${key}`}>
                            <div className="game">
                                <div className="gameImg"><img src={value.icon}></img></div>
                                <div className="gameName">
                                    {value.name}
                                </div>
                            </div>
                        </Link>
                    )}
                </div>} />
                <Route path={`/blackjack`} element={<Blackjack />} />
                <Route path={`/chess`} element={<Chess />} />
                <Route path={`/uno/*`} element={<Uno />} />
            </Routes>
        </>
    )
    for (const [game, { component: Game }] of Object.entries(GAMES))
        if (id === game) {
            content = <Game />;
            break;
        } else content = (
            <div className="gameContainer">
                {Object.entries(GAMES).map(([key, value]) =>
                    <Link key={key} to={`/games/${key}`}>
                        <div className="game">
                            <div className="gameImg"><img src={value.icon}></img></div>
                            <div className="gameName">
                                {value.name}
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        );
    return (
        <>
            <Nav {...props} />
            {content}
        </>
    )
}
export default Games;
/* 
            {Object.entries(GAMES).map(([key, value]) =>
                <div key={key} className="game">
                    {value.name}
                </div>
            )} */