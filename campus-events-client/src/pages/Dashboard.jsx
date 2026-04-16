import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL } from '../config';
import OrganizerScanner from '../components/OrganizerScanner';
import EventAttendees from '../components/EventAttendees';

const Dashboard = () => {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAllMyEvents, setShowAllMyEvents] = useState(false);
    const [scanningEventId, setScanningEventId] = useState(null);
    const [viewingAttendeesEventId, setViewingAttendeesEventId] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', category: '', date: '',
        time: '', registration_deadline: '', team_size: 1, location: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'organizer' && user.role !== 'admin') {
            notify("Access Denied", 'error');
            navigate('/');
            return;
        }

        // Fetch Events
        fetch(`${API_BASE_URL}/events`)
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter(e => e.organizer_id === user.id || e.organizer_email === user.email);
                setMyEvents(filtered);
            })
            .catch(err => console.error(err));
    }, [user, navigate, notify]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            registration_deadline: formData.registration_deadline, // Ensure ID matches state key
            team_size: parseInt(formData.team_size)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                notify('Event Added Successfully!', 'success');
                setFormData({ title: '', description: '', category: '', date: '', time: '', registration_deadline: '', team_size: 1, location: '' });
                // Refresh list logic could go here
            } else {
                notify(data.message || 'Failed to create event.', 'error');
            }
        } catch (error) {
            console.error(error);
            notify('Connection failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const visibleMyEvents = showAllMyEvents ? myEvents : myEvents.slice(0, 4);

    return (
        <div className="container">
            {loading && <Loader />}

            <div className="dashboard-card organizer-only">
                <h2 style={{ margin: '30px 5px' }}>Add Event</h2>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <label htmlFor="title">Event Title:</label>
                    <input type="text" id="title" value={formData.title} onChange={handleChange} required />

                    <label htmlFor="description">Event Description:</label>
                    <textarea id="description" value={formData.description} onChange={handleChange} required />

                    <label htmlFor="category">Category:</label>
                    <input type="text" id="category" value={formData.category} onChange={handleChange} required />

                    <label htmlFor="date">Event Date:</label>
                    <input type="date" id="date" value={formData.date} onChange={handleChange} required />

                    <label htmlFor="time">Event Time:</label>
                    <input type="time" id="time" value={formData.time} onChange={handleChange} required />

                    <label htmlFor="registration_deadline">Last Date For Registration:</label>
                    <input type="date" id="registration_deadline" value={formData.registration_deadline} onChange={handleChange} required />

                    <label htmlFor="team_size">Team Members:</label>
                    <input type="number" id="team_size" value={formData.team_size} onChange={handleChange} required />

                    <label htmlFor="location">Location:</label>
                    <input type="text" id="location" value={formData.location} onChange={handleChange} required />

                    <button type="submit" className="btn">Add Event</button>
                </form>

                <hr style={{ zIndex: 5, margin: '30px' }} />

                <h2 style={{ margin: '30px 5px' }}>Your Events</h2>
                <div className="event-grid" style={showAllMyEvents ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                    {myEvents.length === 0 ? <p>You haven't created any events yet.</p> : visibleMyEvents.map(event => (
                        <div key={event.id} className="card">
                            <div className="card-body">
                                <h3>{event.title}</h3>
                                <span className="date">📅 {new Date(event.event_date).toLocaleDateString()}</span>
                                <p>{event.description ? event.description.substring(0, 80) + '...' : ''}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                                    <Link to={`/events/${event.id}`} className="btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>View Details</Link>
                                    <button onClick={() => setViewingAttendeesEventId(event.id)} className="btn" style={{ flex: 1, backgroundColor: '#36b9cc', color: '#fff' }}>Attendees</button>
                                    <button onClick={() => setScanningEventId(event.id)} className="btn" style={{ flex: 1, backgroundColor: '#f6c23e', color: '#fff' }}>Scan Tickets</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {myEvents.length > 4 && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button className="btn" onClick={() => setShowAllMyEvents(!showAllMyEvents)}>
                            {showAllMyEvents ? 'See Less' : 'See More'}
                        </button>
                    </div>
                )}
            </div>

            {scanningEventId && (
                <div className="loader-overlay" onClick={() => setScanningEventId(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '20px', borderRadius: '10px', position: 'relative', width: '90%', maxWidth: '500px', boxShadow: 'var(--shadow-md)' }}>
                        <button onClick={() => setScanningEventId(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
                        <h3 style={{ marginBottom: '15px', color: '#4e73df', textAlign: 'center' }}>Scan Attendee Tickets</h3>
                        <OrganizerScanner eventId={scanningEventId} />
                    </div>
                </div>
            )}

            {viewingAttendeesEventId && (
                <div className="loader-overlay" onClick={() => setViewingAttendeesEventId(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '20px', borderRadius: '10px', position: 'relative', width: '90%', maxWidth: '700px', boxShadow: 'var(--shadow-md)' }}>
                        <button onClick={() => setViewingAttendeesEventId(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
                        <h3 style={{ marginBottom: '15px', color: '#4e73df', textAlign: 'center' }}>Event Attendees</h3>
                        <EventAttendees eventId={viewingAttendeesEventId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;