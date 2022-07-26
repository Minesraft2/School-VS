import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
const Home = (props) => {
    return (<div className="homeMain">
        <h1 className="homeTitle">Gamit</h1>
        <div className="loginButtons">
            <Link to="/login"><button className="loginButton">Login</button></Link>
            <Link to="/signup"><button className="signupButton">Signup</button></Link>
        </div>
    </div>)
}
export default Home;