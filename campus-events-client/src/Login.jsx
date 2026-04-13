// d:\Campus Events Client React\campus-events-client\src\pages\Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { notify } = useNotification();

    // UI State
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
    const [loading, setLoading] = useState(false);

    // Login Form State
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot/Reset Password State
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8800/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, role })
            });
            const data = await response.json();

            if (response.ok) {
                // Pass the user object to the login function from AuthContext
                login(data.user); 
                notify('Login successful!', 'success');
                
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'organizer') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                notify(data.message || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login Error:', error);
            notify('Login failed. Could not connect to the server.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8800/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await response.json();

            if (response.ok) {
                notify(data.message || 'OTP sent to your email.', 'success');
                setView('reset');
                // Reset reset-flow states
                setOtp('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsOtpVerified(false);
            } else {
                notify(data.message || 'Failed to send OTP. Please check the email address.', 'error');
            }
        } catch (error) {
            console.error('Forgot Password Error:', error);
            notify('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            notify('Please enter the OTP.', 'warning');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8800/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, otp })
            });
            const data = await response.json();

            if (response.ok) {
                notify('OTP Verified Successfully!', 'success');
                setIsOtpVerified(true);
            } else {
                notify(data.message || 'Invalid OTP.', 'error');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            notify('Connection failed. Please check your network.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!isOtpVerified) {
            handleVerifyOtp();
            return;
        }

        if (newPassword !== confirmNewPassword) {
            notify('Passwords do not match.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8800/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, otp, new_password: newPassword })
            });
            const data = await response.json();

            if (response.ok) {
                notify(data.message || 'Password has been reset successfully. Please login.', 'success');
                setView('login');
                // Clear form
                setEmail('');
                setPassword('');
            } else {
                notify(data.message || 'Failed to reset password. Invalid OTP or an error occurred.', 'error');
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            notify('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>{view === 'login' ? 'Login' : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>

                {loading && <p>Loading...</p>}

                {view === 'login' && (
                    <form onSubmit={handleLogin} autoComplete="off">
                        <div className="form-group">
                            <label htmlFor="loginRole">I am a:</label>
                            <select id="loginRole" required value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="student">Student</option>
                                <option value="organizer">Organizer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="loginPassword">Password:</label>
                            <input type="password" id="loginPassword" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); }} style={{ fontSize: '0.9rem', color: '#4e73df' }}>
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>Login</button>
                        <p className="auth-switch" style={{ marginTop: '15px' }}>Don't have an account? <Link to="/register">Sign Up</Link></p>
                    </form>
                )}

                {view === 'forgot' && (
                    <form onSubmit={handleForgotPassword} autoComplete="off">
                        <div className="form-group">
                            <label htmlFor="forgotEmail">Enter your registered email:</label>
                            <input type="email" id="forgotEmail" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>Send Reset OTP</button>
                        <p className="auth-switch" style={{ marginTop: '15px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Back to Login</a>
                        </p>
                    </form>
                )}

                {view === 'reset' && (
                    <form onSubmit={handleResetPassword} autoComplete="off">
                        <div className="form-group">
                            <label htmlFor="resetOtp">Enter OTP:</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    id="resetOtp"
                                    required
                                    placeholder="6-digit OTP"
                                    style={{ flexGrow: 1, marginBottom: 0 }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={isOtpVerified}
                                />
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ padding: '10px', width: 'auto', margin: 0 }}
                                    onClick={handleVerifyOtp}
                                    disabled={isOtpVerified || loading}
                                >
                                    {isOtpVerified ? 'Verified' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        {isOtpVerified && (
                            <div id="newPasswordSection">
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password:</label>
                                    <input type="password" id="newPassword" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                                    <input type="password" id="confirmNewPassword" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                                </div>

                                <button type="submit" className="btn-login" disabled={loading}>Reset Password</button>
                            </div>
                        )}

                        <p className="auth-switch" style={{ marginTop: '15px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Back to Login</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
