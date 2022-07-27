import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../Nav";
import { useAuth } from "../context/AuthContext";

import { Card, Button, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css'

const Settings = (props) => {
    const [error, setError] = useState('');
    const { currentUser, logout } = useAuth();
    window.currentUser = currentUser
    const navigate = useNavigate();
    async function handleLogout() {
        setError('');
        try {
            await logout();
            navigate('/login')
        } catch {
            setError('Failed to log out')
        }
    }
    return (
        <>
            <Nav />
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Profile</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <h3 className="text-center mb-4">{currentUser.displayName}</h3>
                    <strong>Email: </strong> {currentUser.email}
                    <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Update Profile</Link>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                <Button onClick={handleLogout} variant="link">Log Out</Button>
            </div>
        </>
    )
}
export default Settings;