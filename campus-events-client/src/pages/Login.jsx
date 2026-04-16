import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset', 'signup'

    // Forgot/Reset Password State
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    // Signup State
    const [signupRole, setSignupRole] = useState('student');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [isSignupOtpSent, setIsSignupOtpSent] = useState(false);
    const [isSignupOtpVerified, setIsSignupOtpVerified] = useState(false);
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [department, setDepartment] = useState('IT');
    const [academicYear, setAcademicYear] = useState('FY');
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const passwordRef = useRef(null);

    const { login } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle the cookie if it comes in the response body
                if (data.token) {
                    document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
                }
                login(data.user); // Update global auth state
                notify('Login successful!', 'success');
                if (data.user.role === 'admin') navigate('/admin');
                else if (data.user.role === 'organizer') navigate('/dashboard');
                else navigate('/');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed. Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
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
                setError(data.message || 'Failed to send OTP. Please check the email address.');
            }
        } catch (error) {
            console.error('Forgot Password Error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('Please enter the OTP.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, otp })
            });
            const data = await response.json();

            if (response.ok) {
                notify('OTP Verified Successfully!', 'success');
                setIsOtpVerified(true);
            } else {
                setError(data.message || 'Invalid OTP.');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            setError('Connection failed. Please check your network.');
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
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
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
                setError(data.message || 'Failed to reset password. Invalid OTP or an error occurred.');
            }
        } catch (error) {
            console.error('Reset Password Error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendSignupOtp = async () => {
        if (!signupName || !signupEmail || !signupRole) {
            setError('Please fill in Name, Email and Role.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: signupName, email: signupEmail, role: signupRole })
            });
            const data = await response.json();
            if (response.ok) {
                notify(data.message || 'OTP sent successfully.', 'success');
                setIsSignupOtpSent(true);
                setOtpTimer(60);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP. Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySignupOtp = async () => {
        if (!signupOtp) {
            setError('Please enter OTP.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail, otp: signupOtp })
            });
            const data = await response.json();
            if (response.ok) {
                notify('OTP Verified Successfully!', 'success');
                setIsSignupOtpVerified(true);
                setOtpTimer(0);
                setTimeout(() => passwordRef.current?.focus(), 100);
            } else {
                setError(data.message || 'Invalid OTP.');
            }
        } catch (err) {
            console.error(err);
            setError('Verification failed. Connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!isSignupOtpVerified) {
            handleVerifySignupOtp();
            return;
        }

        if (!signupPassword || !signupConfirmPassword || !signupPhone) {
            setError("Please fill in all required fields.");
            return;
        }

        if (signupRole === 'student' && !enrollmentNo) {
            setError("Enrollment number is required.");
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            setError("Passwords don't match.");
            return;
        }
        setLoading(true);
        setError('');

        const formData = {
            username: signupName,
            full_name: signupName,
            email: signupEmail,
            password: signupPassword,
            role: signupRole,
            phone_number: signupPhone,
            department: department || 'IT',
            academic_year: signupRole === 'student' ? academicYear : "",
            enrollment_no: signupRole === 'student' ? Number(enrollmentNo) : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                notify('Registration successful! Please login.', 'success');
                setRole(signupRole);
                setEmail(signupEmail);
                setView('login');
                // Reset signup state
                setSignupName('');
                setSignupEmail('');
                setSignupPassword('');
                setSignupConfirmPassword('');
                setSignupPhone('');
                setEnrollmentNo('');
                setIsSignupOtpSent(false);
                setIsSignupOtpVerified(false);
                setSignupOtp('');
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Registration failed. Connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px' }}>
            <h2>{view === 'login' ? 'Login' : view === 'forgot' ? 'Forgot Password' : view === 'reset' ? 'Reset Password' : 'Sign Up'}</h2>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {view === 'login' && (
                <form onSubmit={handleLogin} autoComplete="off">
                    <label htmlFor="loginRole">I am a:</label>
                    <select id="loginRole" required value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                    </select>

                    <label htmlFor="loginEmail">Email:</label>
                    <input type="email" id="loginEmail" required value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label htmlFor="loginPassword">Password:</label>
                    <input type="password" id="loginPassword" required value={password} onChange={(e) => setPassword(e.target.value)} />

                    <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                        <button type="button" onClick={() => { setView('forgot'); setError(''); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: '#4e73df', cursor: 'pointer', textDecoration: 'underline' }}>
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>Login</button>
                    <div className="auth-switch">
                        <p>Don't have an account? <button type="button" onClick={() => { setView('signup'); setError(''); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: '#4e73df', cursor: 'pointer', textDecoration: 'underline' }}>Register here</button></p>
                    </div>
                </form>
            )}

            {view === 'forgot' && (
                <form onSubmit={handleForgotPassword} autoComplete="off">
                    <label htmlFor="forgotEmail">Enter your registered email:</label>
                    <input type="email" id="forgotEmail" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                    <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>Send Reset OTP</button>
                    <div className="auth-switch" style={{ marginTop: '15px' }}>
                        <button type="button" onClick={() => { setView('login'); setError(''); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: '#4e73df', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
                    </div>
                </form>
            )}

            {view === 'reset' && (
                <form onSubmit={handleResetPassword} autoComplete="off">
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

                    {isOtpVerified && (
                        <div id="newPasswordSection">
                            <label htmlFor="newPassword">New Password:</label>
                            <input type="password" id="newPassword" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                            <input type="password" id="confirmNewPassword" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />

                            <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>Reset Password</button>
                        </div>
                    )}

                    <div className="auth-switch" style={{ marginTop: '15px' }}>
                        <button type="button" onClick={() => { setView('login'); setError(''); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: '#4e73df', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
                    </div>
                </form>
            )}

            {view === 'signup' && (
                <form onSubmit={handleRegister} autoComplete="off">
                    <label htmlFor="signupRole">I am a:</label>
                    <select id="signupRole" required value={signupRole} onChange={(e) => setSignupRole(e.target.value)} disabled={isSignupOtpVerified}>
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                    </select>

                    <label htmlFor="signupName">Full Name:</label>
                    <input type="text" id="signupName" required placeholder="e.g. John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} disabled={isSignupOtpVerified} />

                    <label htmlFor="signupEmail">Email:</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input type="email" id="signupEmail" required style={{ flexGrow: 1, marginBottom: 0 }} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isSignupOtpVerified} />
                        <button type="button" className="btn" style={{ padding: '10px', width: 'auto', margin: 0, whiteSpace: 'nowrap' }} onClick={handleSendSignupOtp} disabled={loading || (isSignupOtpSent && otpTimer > 0) || isSignupOtpVerified}>
                            {isSignupOtpSent ? (otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP') : 'Send OTP'}
                        </button>
                    </div>

                    {isSignupOtpSent && (
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="signupOtp">Enter OTP:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" id="signupOtp" placeholder="6-digit OTP" style={{ flexGrow: 1, marginBottom: 0 }} value={signupOtp} onChange={(e) => setSignupOtp(e.target.value)} disabled={isSignupOtpVerified} />
                                <button type="button" className="btn" style={{ padding: '10px', width: 'auto', margin: 0 }} onClick={handleVerifySignupOtp} disabled={loading || isSignupOtpVerified}>
                                    {isSignupOtpVerified ? 'Verified' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isSignupOtpVerified && (
                        <div id="detailsSection">
                            <label htmlFor="signupPassword">Password:</label>
                            <input type="password" id="signupPassword" ref={passwordRef} required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />

                            <label htmlFor="signupConfirmPassword">Confirm Password:</label>
                            <input type="password" id="signupConfirmPassword" required value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} />

                            <label htmlFor="signupPhone">Phone No:</label>
                            <input type="tel" id="signupPhone" required value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />

                            <label htmlFor="department">Department:</label>
                            <select id="department" required value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="IT">Information Technology</option>
                                <option value="CE">Computer Engineering</option>
                                <option value="EE">Electrical Engineering</option>
                                <option value="ME">Mechanical Engineering</option>
                                <option value="CIV">Civil Engineering</option>
                            </select>

                            {signupRole === 'student' && (
                                <>
                                    <label htmlFor="year">Year:</label>
                                    <select id="year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                                        <option value="FY">First Year</option>
                                        <option value="SY">Second Year</option>
                                        <option value="TY">Third Year</option>
                                        <option value="LY">Fourth Year</option>
                                    </select>

                                    <label htmlFor="enrollmentNo">Enrollment No:</label>
                                    <input type="number" id="enrollmentNo" required value={enrollmentNo} onChange={(e) => setEnrollmentNo(e.target.value)} />
                                </>
                            )}

                            <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>Sign Up</button>
                        </div>
                    )}
                    <div className="auth-switch" style={{ marginTop: '15px' }}>
                        <p>Already have an account? <button type="button" onClick={() => { setView('login'); setError(''); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: '#4e73df', cursor: 'pointer', textDecoration: 'underline' }}>Login</button></p>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Login;