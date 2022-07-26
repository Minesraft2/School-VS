import React, { useEffect } from "react"
import { Link, Navigate } from "react-router-dom";

function Nav(props) {
    return <nav className="nav">
        <Link to="/main" className="site-title">Gamit</Link>
        <ul>
            <CustomLink to="/games">Games</CustomLink>
            <CustomLink to="/leaderboard">Leaderboard</CustomLink>
            <CustomLink to="/settings">Settings</CustomLink>
        </ul>
    </nav>
}

function CustomLink({ to, children, ...props }) {
    return (
        <li>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}

export default Nav