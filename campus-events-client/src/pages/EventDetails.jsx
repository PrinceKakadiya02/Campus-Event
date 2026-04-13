import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL } from '../config';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        if (user && user.phone_number) {
            setPhone(user.phone_number);
        }
    }, [user]);

    useEffect(() => {
        // Fetch all events and find the one matching ID (assuming API doesn't support single fetch yet)
        // If API supports /events/:id, replace this logic.
        fetch(`${API_BASE_URL}/events`)
            .then(res => res.json())
            .then(data => {
                const eventsArray = Array.isArray(data) ? data : (data?.events || data?.data || []);
                const found = eventsArray.find(e => String(e.id) === String(id));
                setEvent(found);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    // Safely parse the team size to handle both string/number types and camelCase vs snake_case naming
    const teamSize = event ? parseInt(event.no_of_team_members || event.team_size || event.teamSize || 1, 10) : 1;

    useEffect(() => {
        if (teamSize > 1) {
            // Use Math.max to prevent RangeError: Invalid array length if teamSize is ever 0
            setTeamMembers(Array.from({ length: Math.max(0, teamSize - 1) }, () => ({ name: '', email: '' })));
        } else {
            setTeamMembers([]);
        }
    }, [teamSize]);

    const handleTeamMemberChange = (index, field, value) => {
        const updatedMembers = [...teamMembers];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        setTeamMembers(updatedMembers);
    };

    const submitRegistration = async (e) => {
        e.preventDefault();

        if (!user) {
            notify("Please login to register.", 'warning');
            navigate('/login');
            return;
        }
        if (user.role !== 'student') {
            notify("Only students can register for events.", 'warning');
            return;
        }

        try {
            // Extract the token from cookies
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

            const payload = {
                registation_type: teamSize > 1 ? 'team' : 'solo',
                full_name: user?.full_name || user?.name || '',
                email: user?.email || '',
                phone_number: phone,
                team_members: teamMembers
            };

            const res = await fetch(`${API_BASE_URL}/events/${event.id}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                notify("Registered successfully!", 'success');
                navigate('/profile');
            } else {
                notify(data.message || "Registration failed.", 'error');
            }
        } catch (err) {
            console.error(err);
            notify("Connection error.", 'error');
        }
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (!event) return <div className="container"><p>Event not found.</p></div>;

    return (
        <div className="container">
            <div className="event-header">
                <h2>{event.title}</h2>
                <div className="event-meta">
                    <span>📅 {new Date(event.event_date || event.date).toLocaleDateString()} | ⏰ {event.time} | 📍 {event.location} | 👥 Team Size: {teamSize}</span>
                </div>
            </div>
            <div className="event-description">
                <p>{event.description}</p>
            </div>

            <div className="dashboard-card" style={{ marginTop: '30px', padding: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Register for Event</h3>
                <form onSubmit={submitRegistration} autoComplete="off">
                    <label>Name:</label>
                    <input type="text" value={user?.full_name || user?.name || ''} disabled style={{ backgroundColor: '#eaecf4' }} />

                    <label>Email:</label>
                    <input type="email" value={user?.email || ''} disabled style={{ backgroundColor: '#eaecf4', marginBottom: '15px' }} />

                    <label>Phone:</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ marginBottom: '15px' }} />

                    {teamSize > 1 && (
                        <div className="team-members-section">
                            <h4 style={{ marginBottom: '10px' }}>Team Members ({teamSize - 1} required)</h4>
                            {teamMembers.map((member, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <label>Member {index + 1} Name:</label>
                                    <input
                                        type="text"
                                        required
                                        value={member.name}
                                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                        placeholder={`Enter Member ${index + 1} name`}
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <label>Member {index + 1} Email:</label>
                                    <input
                                        type="email"
                                        required
                                        value={member.email}
                                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                        placeholder={`Enter Member ${index + 1} email`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn" style={{ flex: 1, backgroundColor: '#1cc88a' }}>Register Now</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventDetails;