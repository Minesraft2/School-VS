import React from "react";
import Leaderboard from "./pages/Leaderboard";
import Main from "./pages/Main";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import { Route, Routes, Navigate } from 'react-router-dom';
import Signup from "./pages/Signup";
import { Container } from 'react-bootstrap';
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import UpdateProfile from "./pages/UpdateProfile";
import NotFound from "./pages/NotFound";
import "./App.css";

const App = (props) => {
    return (<>

        <AuthProvider>
            <Routes basename="/">
                <Route path="/update-profile" element={<PrivateRoute><UpdateProfile {...props} /></PrivateRoute>}></Route>
                <Route path="/main" element={<PrivateRoute><Main {...props} /></PrivateRoute>}></Route>
                <Route path="/games/*" element={<PrivateRoute><Games {...props} /></PrivateRoute>}></Route>
                <Route path="/settings" element={<PrivateRoute><Settings {...props} /></PrivateRoute>}></Route>
                <Route path="/login" element={(
                    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                        <div className="w-100" style={{ maxWidth: '400px' }}>
                            <Login />
                        </div>
                    </Container>
                )}></Route>
                <Route path="/signup" element={(
                    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                        <div className="w-100" style={{ maxWidth: '400px' }}>
                            <Signup />
                        </div>
                    </Container>
                )}></Route>
                <Route path="/forgot-password" element={(
                    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                        <div className="w-100" style={{ maxWidth: '400px' }}>
                            <ForgotPassword />
                        </div>
                    </Container>
                )}></Route>
                <Route exact path="/" element={<Home />}></Route>
                <Route path="/leaderboard" element={<Leaderboard {...props} />}></Route>
                <Route path="/*" element={<NotFound {...props} />}></Route>
            </Routes>
        </AuthProvider >
        {/* <Routes basename="/">
        </Routes> */}
    </>)
}
export default App;