import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuid, NIL as nil } from "uuid";
import "./Uno.css";

const Homepage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [roomCode, setRoomCode] = useState('');
    useEffect(() => {
        if (searchParams.has('error')) setError(decodeURI(searchParams.get('error')));
    });
    return (
        <>
            {error}
            <div className='homepage-join'>
                <input type='text' placeholder='Game Code' onChange={(event) => setRoomCode(event.target.value)} />
                <Link to={`play?room=${roomCode}`}><button className="game-button green">JOIN GAME</button></Link>
            </div>
            <h1>OR</h1>
            <div className='homepage-create'>
                <Link to={`play?host=${nil}`}><button className="game-button orange">CREATE GAME</button></Link>
            </div>
        </>
    )
}

export default Homepage