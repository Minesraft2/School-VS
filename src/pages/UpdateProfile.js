import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css'

const UpdateProfile = (props) => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { currentUser, updateEmail, updatePassword } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    function handleSubmit(e) {
        e.preventDefault();
        if (passwordRef.current.value !== passwordConfirmRef.current.value) return setError("Passwords do not match");
        const promises = [];
        if (emailRef.current.value !== currentUser.email) promises.push(updateEmail(emailRef.current.value));
        if (passwordRef.current.value) promises.push(updatePassword(passwordRef.current.value));
        setLoading(true);
        setError('');
        Promise.all(promises).then(() => {
            navigate('/settings');
        }).catch((err) => setError(err.code == "auth/requires-recent-login" ? "This action requires a recent login." : "Failed to update account.")).finally(() => setLoading(false));
    }
    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Update Profile</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required defaultValue={currentUser.email} />
                        </Form.Group>
                        <Form.Group id="update-password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} autoComplete="new-password" placeholder="Leave blank to leave the same" />
                        </Form.Group>
                        <Form.Group id="update-password-confirm">
                            <Form.Label>Password Confirmation</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} placeholder="Confirm Password" />
                        </Form.Group>
                        <Button disabled={loading} className="w-100" type="submit">Update</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                <Link to="/settings">Cancel</Link>
            </div>
        </>
    )
}
export default UpdateProfile;