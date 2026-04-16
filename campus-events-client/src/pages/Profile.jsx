import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import UserEventTicket from '../components/UserEventTicket';

const Profile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllPast, setShowAllPast] = useState(false);
    const [activeTicketEventId, setActiveTicketEventId] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', phone_number: '', department: '', academic_year: '', enrollment_no: '' });
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setEditData({
                full_name: user.full_name && user.full_name !== 'undefined' ? user.full_name : (user.name && user.name !== 'undefined' ? user.name : ''),
                phone_number: user.phone_number || '',
                department: user.department || '',
                academic_year: user.academic_year || '',
                enrollment_no: user.enrollment_no || ''
            });
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'student') {
            fetch(`${API_BASE_URL}/user/registrations`, { credentials: 'include' })
                .then(res => {
                    if (res.status === 401) {
                        navigate('/login');
                        throw new Error('Unauthorized');
                    }
                    return res.json();
                })
                .then(data => setRegistrations(Array.isArray(data) ? data : []))
                .catch(err => console.error(err));
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateMessage({ type: '', text: '' });

        const payload = {
            ...editData,
            academic_year: editData.academic_year || null,
            enrollment_no: editData.enrollment_no ? Number(editData.enrollment_no) : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.status === 200) {
                setUpdateMessage({ type: 'success', text: data.message || "Profile updated successfully." });
                setIsEditing(false);
                // Update global user context state with the latest data
                if (login) {
                    login({
                        ...user,
                        name: data.user?.full_name || editData.full_name,
                        full_name: data.user?.full_name || editData.full_name,
                        phone_number: data.user?.phone_number || editData.phone_number,
                        department: data.user?.department || editData.department,
                        academic_year: data.user?.academic_year || editData.academic_year,
                        enrollment_no: data.user?.enrollment_no || editData.enrollment_no
                    });
                }
            } else if (response.status === 404) {
                setUpdateMessage({ type: 'error', text: data.message || "User not found." });
            } else if (response.status === 500) {
                setUpdateMessage({ type: 'error', text: data.message || "Internal Server Error." });
            } else {
                setUpdateMessage({ type: 'error', text: data.message || "Update failed." });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setUpdateMessage({ type: 'error', text: "Connection error while updating profile." });
        }
    };

    const { upcomingRegistrations, pastRegistrations } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Ignore time to only compare calendar days

        const upcoming = registrations.filter(reg => {
            const event = reg.event || reg;
            if (String(event.id) === '409') return true;
            const eventDateStr = event.date || event.event_date;
            if (!eventDateStr) return true;
            const eventDate = new Date(eventDateStr);
            return isNaN(eventDate.getTime()) || eventDate >= now;
        });

        const past = registrations.filter(reg => {
            const event = reg.event || reg;
            if (String(event.id) === '409') return false;
            const eventDateStr = event.date || event.event_date;
            if (!eventDateStr) return false;
            const eventDate = new Date(eventDateStr);
            return !isNaN(eventDate.getTime()) && eventDate < now;
        });

        return { upcomingRegistrations: upcoming, pastRegistrations: past };
    }, [registrations]);

    const visibleUpcoming = showAllUpcoming ? upcomingRegistrations : upcomingRegistrations.slice(0, 4);
    const visiblePast = showAllPast ? pastRegistrations : pastRegistrations.slice(0, 4);

    return (
        <div className="container">
            <div className="profile-header" style={{ marginBottom: '30px' }}>
                <h2>My Profile</h2>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="profile-header-content">
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f2f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem'
                        }}>
                            {(user.full_name && user.full_name !== 'undefined' ? user.full_name : (user.name && user.name !== 'undefined' ? user.name : 'User')).charAt(0).toUpperCase()}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, color: '#4e73df' }}>{user.full_name && user.full_name !== 'undefined' ? user.full_name : (user.name && user.name !== 'undefined' ? user.name : 'User')}</h3>
                                <span style={{
                                    background: user.role === 'admin' ? '#e74a3b' : user.role === 'organizer' ? '#36b9cc' : '#1cc88a',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div>
                            {user.role === 'organizer' && (
                                <Link to="/dashboard" className="btn" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="btn" style={{ textDecoration: 'none' }}>Admin</Link>
                            )}
                        </div>
                    </div>

                    <hr style={{ border: 0, borderTop: '1px solid #e3e6f0', margin: '30px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ color: '#5a5c69', margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Personal Information
                        </h4>
                        {!isEditing && (
                            <button className="btn" onClick={() => setIsEditing(true)} style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Edit Profile</button>
                        )}
                    </div>

                    {updateMessage.text && (
                        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: updateMessage.type === 'error' ? '#f8d7da' : '#d4edda', color: updateMessage.type === 'error' ? '#721c24' : '#155724' }}>
                            {updateMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                            {isEditing && (
                                <div className="info-group">
                                    <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Full Name</label>
                                    <input type="text" name="full_name" value={editData.full_name} onChange={handleEditChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d3e2', borderRadius: '4px' }} />
                                </div>
                            )}

                            <div className="info-group">
                                <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                                <p style={{ margin: 0, color: '#5a5c69', fontWeight: '500', wordBreak: 'break-all', padding: isEditing ? '8px 0' : '0' }}>{user.email}</p>
                            </div>

                            <div className="info-group">
                                <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Phone Number</label>
                                {isEditing ? (
                                    <input type="tel" name="phone_number" value={editData.phone_number} onChange={handleEditChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d3e2', borderRadius: '4px' }} />
                                ) : (
                                    <p style={{ margin: 0, color: '#5a5c69', fontWeight: '500' }}>{user.phone_number || 'Not Provided'}</p>
                                )}
                            </div>

                            <div className="info-group">
                                <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Department</label>
                                {isEditing ? (
                                    <input type="text" name="department" value={editData.department} onChange={handleEditChange} disabled={user.role === 'admin'} style={{ width: '100%', padding: '8px', border: '1px solid #d1d3e2', borderRadius: '4px', backgroundColor: user.role === 'admin' ? '#eaecf4' : '#fff' }} />
                                ) : (
                                    <p style={{ margin: 0, color: '#5a5c69', fontWeight: '500' }}>{user.role === 'admin' ? 'Administration' : (user.department || 'Not Assigned')}</p>
                                )}
                            </div>

                            {user.role === 'student' && (
                                <>
                                    <div className="info-group">
                                        <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Enrollment Number</label>
                                        {isEditing ? (
                                            <input type="number" name="enrollment_no" value={editData.enrollment_no} onChange={handleEditChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d3e2', borderRadius: '4px' }} />
                                        ) : (
                                            <p style={{ margin: 0, color: '#5a5c69', fontWeight: '500', padding: isEditing ? '8px 0' : '0' }}>{user.enrollment_no || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="info-group">
                                        <label style={{ display: 'block', color: '#858796', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Academic Year</label>
                                        {isEditing ? (
                                            <input type="text" name="academic_year" value={editData.academic_year} onChange={handleEditChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d3e2', borderRadius: '4px' }} />
                                        ) : (
                                            <p style={{ margin: 0, color: '#5a5c69', fontWeight: '500', padding: isEditing ? '8px 0' : '0' }}>{user.academic_year || 'N/A'}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {isEditing && (
                            <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                                <button type="submit" className="btn" style={{ backgroundColor: '#1cc88a' }}>Save Changes</button>
                                <button type="button" className="btn" style={{ backgroundColor: '#e74a3b' }} onClick={() => { setIsEditing(false); setUpdateMessage({ type: '', text: '' }); }}>Cancel</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {user.role === 'student' ? (
                <>
                    <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Upcoming Registrations</h2>
                    <div className="event-grid" style={showAllUpcoming ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                        {upcomingRegistrations.length === 0 ? (
                            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: '#858796' }}>You have not registered for any upcoming events yet.</p>
                                <Link to="/events" className="btn" style={{ marginTop: '10px', display: 'inline-block' }}>Browse Events</Link>
                            </div>
                        ) : (
                            visibleUpcoming.map((reg, index) => {
                                const event = reg.event || reg;
                                return (
                                    <div key={index} className="card" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
                                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{event.title || 'Event'}</h3>
                                            <div style={{ color: '#858796', fontSize: '0.9rem', flexGrow: 1 }}>
                                                <p style={{ margin: '0 0 5px 0' }}>📅 {event.date || event.event_date ? new Date(event.date || event.event_date).toLocaleDateString() : 'N/A'}</p>
                                                {event.time && <p style={{ margin: 0 }}>⏰ {event.time}</p>}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Status:</span>
                                                <span style={{
                                                    background: '#e2e6ea',
                                                    padding: '4px 10px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    color: '#5a5c69'
                                                }}>
                                                    {reg.status || 'Registered'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <Link to={`/events/${event.id}`} className="btn" style={{ flex: 1, textAlign: 'center', display: 'block', textDecoration: 'none' }}>View Details</Link>
                                                <button onClick={() => setActiveTicketEventId(event.id)} className="btn" style={{ flex: 1, backgroundColor: '#36b9cc' }}>View Ticket</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {upcomingRegistrations.length > 4 && (
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button className="btn" onClick={() => setShowAllUpcoming(!showAllUpcoming)}>
                                {showAllUpcoming ? 'See Less' : 'See More'}
                            </button>
                        </div>
                    )}

                    <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Past Events</h2>
                    <div className="event-grid" style={showAllPast ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                        {pastRegistrations.length === 0 ? (
                            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: '#858796' }}>You do not have any past event registrations.</p>
                            </div>
                        ) : (
                            visiblePast.map((reg, index) => {
                                const event = reg.event || reg;
                                return (
                                    <div key={index} className="card" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{event.title || 'Event'}</h3>
                                            <div style={{ color: '#858796', fontSize: '0.9rem', flexGrow: 1 }}>
                                                <p style={{ margin: '0 0 5px 0' }}>📅 {event.date || event.event_date ? new Date(event.date || event.event_date).toLocaleDateString() : 'N/A'}</p>
                                                {event.time && <p style={{ margin: 0 }}>⏰ {event.time}</p>}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Status:</span>
                                                <span style={{ background: '#e2e6ea', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', color: '#5a5c69' }}>
                                                    {reg.status || 'Registered'}
                                                </span>
                                            </div>
                                            <Link to={`/events/${event.id}`} className="btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>View Details</Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {pastRegistrations.length > 4 && (
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button className="btn" onClick={() => setShowAllPast(!showAllPast)}>
                                {showAllPast ? 'See Less' : 'See More'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ marginTop: '40px', textAlign: 'center', color: '#858796' }}>
                    <p>
                        {user.role === 'admin'
                            ? "As an admin, you can manage events and users from the Admin Panel."
                            : "As an organizer, you can manage your events from the Dashboard."}
                    </p>
                </div>
            )}

            {activeTicketEventId && (
                <div className="loader-overlay" onClick={() => setActiveTicketEventId(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '20px', borderRadius: '10px', position: 'relative', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-md)' }}>
                        <button onClick={() => setActiveTicketEventId(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <UserEventTicket eventId={activeTicketEventId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;