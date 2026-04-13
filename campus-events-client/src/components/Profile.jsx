import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import './Profile.css';

const Profile = () => {
    const { user, loading } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [registrationsLoading, setRegistrationsLoading] = useState(false);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (user && user.role === 'student') {
                setRegistrationsLoading(true);
                try {
                    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const res = await fetch('http://localhost:8800/user/registrations', {
                        headers: headers,
                        credentials: 'include'
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setRegistrations(data);
                    } else {
                        console.error("Failed to fetch registrations");
                    }
                } catch (error) {
                    console.error("Error fetching registrations:", error);
                } finally {
                    setRegistrationsLoading(false);
                }
            }
        };

        fetchRegistrations();
    }, [user]);

    if (loading) return <LoadingScreen />;

    if (!user) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Please log in to view your profile.</div>;

    return (
        <div className="container">
            <h2>My Profile</h2>
            <div className="card">
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '4rem' }}>👤</div>
                        <div>
                            <h3 style={{ color: '#4e73df', marginBottom: '5px' }}>{user.full_name || user.name || "User"}</h3>
                            <span style={{ background: '#1cc88a', color: 'white', padding: '3px 10px', borderRadius: '15px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{user.role}</span>
                        </div>
                    </div>
                    <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '20px 0' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <strong>Email:</strong>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <strong>Phone:</strong>
                            <p>{user.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                            <strong>Department:</strong>
                            <p>{user.department || 'N/A'}</p>
                        </div>
                        {user.role === 'student' && (
                            <>
                                <div>
                                    <strong>Enrollment No:</strong>
                                    <p>{user.enrollment_no || 'N/A'}</p>
                                </div>
                                <div>
                                    <strong>Year:</strong>
                                    <p>{user.academic_year || 'N/A'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '40px' }}>My Registrations</h2>
            <div className="event-grid">
                {user.role !== 'student' ? (
                    <p>Registrations are not applicable for this role.</p>
                ) : registrationsLoading ? (
                    <p>Loading registrations...</p>
                ) : registrations.length === 0 ? (
                    <p>You have not registered for any events yet.</p>
                ) : (
                    registrations.map((reg, index) => {
                        const event = reg.event || reg;
                        return (
                            <div key={index} className="card">
                                <div className="card-body">
                                    <h3>{event.title || 'Event'}</h3>
                                    <span className="date">📅 {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
                                    <p>Status: <strong>{reg.status || 'Registered'}</strong></p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Profile;