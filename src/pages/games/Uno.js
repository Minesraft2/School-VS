import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useParams, Outlet } from "react-router-dom";
import Homepage from "./Uno/UnoHome";
import Game from "./Uno/UnoGame";

const Uno = (props) => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/play" element={<Game />} />
            </Routes>
        </>
    )
}
export default Uno;