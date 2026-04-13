import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL } from '../config';

const Admin = () => {
    const { user } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [pendingEvents, setPendingEvents] = useState([]);
    const [pendingOrganizers, setPendingOrganizers] = useState([]);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [showAllOrganizers, setShowAllOrganizers] = useState(false);
    const [organizersList, setOrganizersList] = useState([]);
    const [stats, setStats] = useState({
        totalEvents: 0,
        upcomingEvents: 0,
        pendingEvents: 0,
        totalOrganizers: 0,
        pendingOrganizers: 0,
        totalStudents: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Events (Added credentials so Admin can see private/pending events)
                const eventsRes = await fetch(`${API_BASE_URL}/events`, { credentials: 'include' });

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();

                    // Extract the array whether it's wrapped in an object or sent directly
                    const eventsArray = Array.isArray(eventsData) ? eventsData : (eventsData.events || []);

                    if (Array.isArray(eventsArray)) {
                        const pending = eventsArray.filter(e => e.status === 'pending' || e.approval_status === 'pending');
                        const upcoming = eventsArray.filter(e => (e.status === 'approved' || e.approval_status === 'approved') && new Date(e.registration_deadline || e.event_date || e.date) >= new Date());

                        setPendingEvents(pending);
                        setStats(prev => ({
                            ...prev,
                            totalEvents: eventsArray.length,
                            upcomingEvents: upcoming.length,
                            pendingEvents: pending.length
                        }));
                    }
                }

                // Fetch Users (for stats and pending organizers)
                const usersRes = await fetch(`${API_BASE_URL}/user`, { credentials: 'include' });
                if (usersRes.ok) {
                    const usersData = await usersRes.json();

                    // Extract the array whether it's wrapped in an object or sent directly
                    const usersArray = Array.isArray(usersData) ? usersData : (usersData.users || usersData.data || []);

                    if (Array.isArray(usersArray)) {
                        const organizers = usersArray.filter(u => u.role === 'organizer');
                        const students = usersArray.filter(u => u.role === 'student');
                        // Assuming 'is_verified' or 'status' field for organizers
                        const pendingOrgs = organizers.filter(u => u.approval_status === 'pending');
                        const approvedOrgs = organizers.filter(u => u.approval_status === 'approved');

                        setPendingOrganizers(pendingOrgs);
                        setOrganizersList(organizers);
                        setStats(prev => ({
                            ...prev,
                            totalOrganizers: approvedOrgs.length,
                            pendingOrganizers: pendingOrgs.length,
                            totalStudents: students.length
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching admin data:", err);
            }
        };

        if (user && user.role === 'admin') {
            fetchDashboardData();
        }
    }, [user]);

    const handleEventAction = async (eventId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setPendingEvents(prev => prev.filter(e => e.id !== eventId));
                setStats(prev => ({ ...prev, pendingEvents: prev.pendingEvents - 1 }));
                notify(`Event ${status} successfully.`, 'success');
            } else {
                notify("Failed to update event status.", 'error');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            notify("Connection error.", 'error');
        }
    };

    const handleOrganizerAction = async (organizerId, status) => {
        try {
            // Assuming endpoint for updating user/organizer status
            const response = await fetch(`${API_BASE_URL}/admin/organizer/${organizerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (response.ok) {
                setPendingOrganizers(prev => prev.filter(o => o.id !== organizerId));
                setStats(prev => ({
                    ...prev,
                    pendingOrganizers: prev.pendingOrganizers - 1,
                    totalOrganizers: status === 'approved' ? prev.totalOrganizers + 1 : prev.totalOrganizers
                }));
                notify(data.message || `Organizer ${status} successfully.`, 'success');
            } else {
                notify(data.message || "Failed to update organizer status.", 'error');
            }
        } catch (error) {
            console.error("Error updating organizer:", error);
            notify("Connection error.", 'error');
        }
    };

    if (!user || user.role !== 'admin') return null;

    const visibleEvents = showAllEvents ? pendingEvents : pendingEvents.slice(0, 4);
    const visibleOrganizers = showAllOrganizers ? pendingOrganizers : pendingOrganizers.slice(0, 4);

    return (
        <div className="container">
            <h2>Admin Dashboard</h2>

            {/* Overview Section */}
            <div className="overview-section" style={{ marginBottom: '30px' }}>
                <h3>Overview</h3>
                <div className="event-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <StatCard title="Total Events" value={stats.totalEvents} />
                    <StatCard title="Upcoming Events" value={stats.upcomingEvents} />
                    <StatCard title="Pending Events" value={stats.pendingEvents} />
                    <StatCard title="Total Organizers" value={stats.totalOrganizers} />
                    <StatCard title="Pending Organizers" value={stats.pendingOrganizers} />
                    <StatCard title="Total Students" value={stats.totalStudents} />
                </div>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

            <h3>Pending Event Requests</h3>
            <div className="event-grid" style={showAllEvents ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                {pendingEvents.length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    visibleEvents.map(event => {
                        // Find the organizer details from the users list we fetched earlier
                        const org = organizersList.find(o => o.id === event.organizer_id) || {};
                        const orgDisplayName = event.organizer_name || org.full_name || org.name || event.organizer_email || org.email || 'Unknown';

                        return (
                            <div key={event.id} className="card">
                                <div className="card-body">
                                    <div style={{ background: '#f8f9fa', padding: '8px', borderRadius: '5px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        <strong>👤 Organizer:</strong> {orgDisplayName} <br />
                                    </div>
                                    <h3>{event.title || 'Untitled Event'}</h3>
                                    <span className="date">📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}</span>
                                    <p>{event.description}</p>
                                    <Link to={`/events/${event.id}`} className="btn" style={{ display: 'block', textAlign: 'center', marginTop: '15px', backgroundColor: '#4e73df' }}>View Details</Link>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleEventAction(event.id, 'approved')} className="btn" style={{ backgroundColor: '#1cc88a', flex: 1 }}>Accept</button>
                                        <button onClick={() => handleEventAction(event.id, 'rejected')} className="btn" style={{ backgroundColor: '#e74a3b', flex: 1 }}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {pendingEvents.length > 4 && (
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button className="btn" onClick={() => setShowAllEvents(!showAllEvents)}>
                        {showAllEvents ? 'See Less' : 'See More'}
                    </button>
                </div>
            )}

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

            {/* Pending Organizer Approvals */}
            <h3>Pending Organizer Approvals</h3>
            <div className="event-grid" style={showAllOrganizers ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                {pendingOrganizers.length === 0 ? (
                    <p>No pending organizer approvals.</p>
                ) : (
                    visibleOrganizers.map(org => (
                        <div key={org.id} className="card">
                            <div className="card-body">
                                <h3>{org.full_name || org.name}</h3>
                                <p style={{ marginBottom: '5px' }}><strong>📧 Email:</strong> {org.email}</p>
                                <p style={{ marginBottom: '5px' }}><strong>📞 Phone:</strong> {org.phone_number || 'N/A'}</p>
                                <p style={{ marginBottom: '15px' }}><strong>🏢 Dept:</strong> {org.department || 'N/A'}</p>

                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleOrganizerAction(org.id, 'approved')} className="btn" style={{ backgroundColor: '#1cc88a', flex: 1 }}>Approve</button>
                                    <button onClick={() => handleOrganizerAction(org.id, 'rejected')} className="btn" style={{ backgroundColor: '#e74a3b', flex: 1 }}>Reject</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {pendingOrganizers.length > 4 && (
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <button className="btn" onClick={() => setShowAllOrganizers(!showAllOrganizers)}>
                        {showAllOrganizers ? 'See Less' : 'See More'}
                    </button>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="card">
        <div className="card-body">
            <h3>{title}</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4e73df' }}>{value}</p>
        </div>
    </div>
);

export default Admin;