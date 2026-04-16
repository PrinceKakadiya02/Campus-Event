import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL } from '../config';

const Register = () => {
    const navigate = useNavigate();
    const { notify } = useNotification();

    // Form State
    const [formData, setFormData] = useState({
        role: 'student',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: 'IT',
        year: 'FY',
        enrollmentNo: ''
    });

    // OTP State
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const passwordRef = useRef(null);

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const validateForm = (data) => {
        const isValid = (val) => val !== null && val !== undefined && val.toString().trim() !== '';

        let valid = isValid(data.role) &&
            isValid(data.name) &&
            isValid(data.email) &&
            isValid(data.password) &&
            isValid(data.confirmPassword) &&
            isValid(data.phone) &&
            isValid(data.department);

        if (data.role === 'student') {
            valid = valid && isValid(data.year) && isValid(data.enrollmentNo);
        }
        return valid;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const updatedFormData = { ...formData, [id]: value };
        setFormData(updatedFormData);

        if (error === 'All fields are mandatory') {
            if (validateForm(updatedFormData)) {
                setError('');
            }
        } else if (error) {
            setError('');
        }
    };

    const handleSendOtp = async () => {
        if (!formData.name || !formData.email || !formData.role) {
            setError('Please fill in Name, Email and Role first.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role })
            });
            const data = await response.json();
            if (response.ok) {
                notify(data.message || 'OTP sent successfully.', 'success');
                setIsOtpSent(true);
                setOtpTimer(60);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP. Connection error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('Please enter OTP.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otp })
            });
            const data = await response.json();
            if (response.ok) {
                notify('OTP Verified Successfully!', 'success');
                setIsOtpVerified(true);
                setOtpTimer(0);
                setTimeout(() => passwordRef.current?.focus(), 100);
            } else {
                setError(data.message || 'Invalid OTP.');
            }
        } catch (err) {
            console.error(err);
            setError('Verification failed. Connection error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!isOtpVerified) {
            handleVerifyOtp();
            return;
        }

        if (!validateForm(formData)) {
            setError('All fields are mandatory');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords Don't Match");
            return;
        }

        setIsSubmitting(true);
        setError('');

        const payload = {
            username: formData.name,
            full_name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone_number: formData.phone,
            department: formData.department,
            academic_year: formData.role === 'student' ? formData.year : "",
            enrollment_no: formData.role === 'student' ? Number(formData.enrollmentNo) : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                notify('Registration happened successfully!', 'success');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            {isSubmitting && <Loader />}
            <h2>Create Account</h2>
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            <form onSubmit={handleRegister} autoComplete="off">
                <label htmlFor="role">I am a:</label>
                <select id="role" value={formData.role} onChange={handleChange} required disabled={isOtpVerified}>
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                </select>

                <label htmlFor="name">Full Name:</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Michel Doe" disabled={isOtpVerified} />

                <label htmlFor="email">Email:</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input type="email" id="email" value={formData.email} onChange={handleChange} required style={{ flexGrow: 1, marginBottom: 0 }} disabled={isOtpVerified} />
                    <button type="button" className="btn" style={{ padding: '10px', width: 'auto', margin: 0, whiteSpace: 'nowrap' }} onClick={handleSendOtp} disabled={isSubmitting || (isOtpSent && otpTimer > 0) || isOtpVerified}>
                        {isOtpSent ? (otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP') : 'Send OTP'}
                    </button>
                </div>

                {isOtpSent && !isOtpVerified && (
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="otp">Enter OTP:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" id="otp" placeholder="6-digit OTP" style={{ flexGrow: 1, marginBottom: 0 }} value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isOtpVerified} />
                            <button type="button" className="btn" style={{ padding: '10px', width: 'auto', margin: 0 }} onClick={handleVerifyOtp} disabled={isSubmitting || isOtpVerified}>
                                Verify
                            </button>
                        </div>
                    </div>
                )}

                {isOtpVerified && (
                    <div id="detailsSection">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" ref={passwordRef} value={formData.password} onChange={handleChange} required />

                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                        <label htmlFor="phone">Phone No:</label>
                        <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required />

                        <label htmlFor="department">Department:</label>
                        <select id="department" value={formData.department} onChange={handleChange} required>
                            <option value="IT">Information Technology</option>
                            <option value="CE">Computer Engineering</option>
                            <option value="EE">Electrical Engineering</option>
                            <option value="ME">Mechanical Engineering</option>
                            <option value="CIV">Civil Engineering</option>
                        </select>

                        {formData.role === 'student' && (
                            <div id="student-fields">
                                <label htmlFor="year">Year:</label>
                                <select id="year" value={formData.year} onChange={handleChange}>
                                    <option value="FY">First Year</option>
                                    <option value="SY">Second Year</option>
                                    <option value="TY">Third Year</option>
                                    <option value="LY">Fourth Year</option>
                                </select>

                                <label htmlFor="enrollmentNo">Enrollment No:</label>
                                <input type="number" id="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange} required />
                            </div>
                        )}

                        <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%' }}>Sign Up</button>
                    </div>
                )}

                <div className="auth-switch" style={{ marginTop: '15px' }}>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </form>
        </div>
    );
};

export default Register;