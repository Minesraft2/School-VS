import React, { useEffect } from "react";
import Nav from "../Nav";
import { useAuth } from "../context/AuthContext";
const Home = (props) => {
    const { currentUser } = useAuth();
    return (<>
        <Nav {...props} />
        <h1>Home<br />{new Date().toString()}</h1>
    </>)
}
export default Home;