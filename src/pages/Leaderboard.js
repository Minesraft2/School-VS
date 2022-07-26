import React from "react";
import Nav from "../Nav";
const Leaderboard = (props) => {
    return (
        <>
            <Nav {...props} />
            <h1>Leaderboard<br />{new Date().toString()}</h1>
        </>
    )
}
export default Leaderboard;