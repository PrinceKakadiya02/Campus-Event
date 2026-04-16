import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import Loader from './Loader';

const EventAttendees = ({ eventId }) => {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('registered'); // 'registered' or 'attended'

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/events/${eventId}/registrations`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok) {
                    // Safely extract the array whether wrapped in a data property or not
                    setAttendees(Array.isArray(data) ? data : (data.data || data.registrations || []));
                } else {
                    setError(data.message || 'Failed to fetch attendees.');
                }
            } catch (err) {
                console.error(err);
                setError('Connection error while fetching attendees.');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendees();
    }, [eventId]);

    if (loading) return <div style={{ minHeight: '100px', position: 'relative' }}><Loader /></div>;
    if (error) return <p style={{ color: '#e74a3b', textAlign: 'center' }}>{error}</p>;

    // Filter based on whether they have scanned in (attended)
    const attendedList = attendees.filter(a => a.status === 'attended' || a.is_attended === true);
    const displayList = activeTab === 'attended' ? attendedList : attendees;

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className="btn" onClick={() => setActiveTab('registered')} style={{ flex: 1, backgroundColor: activeTab === 'registered' ? '#4e73df' : '#eaecf4', color: activeTab === 'registered' ? '#fff' : '#5a5c69' }}>
                    All Registered ({attendees.length})
                </button>
                <button className="btn" onClick={() => setActiveTab('attended')} style={{ flex: 1, backgroundColor: activeTab === 'attended' ? '#1cc88a' : '#eaecf4', color: activeTab === 'attended' ? '#fff' : '#5a5c69' }}>
                    Attended ({attendedList.length})
                </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {displayList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#858796', marginTop: '20px' }}>No students found in this category.</p>
                ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '2px solid #ddd', padding: '10px 8px', color: '#5a5c69' }}>Name</th>
                                <th style={{ borderBottom: '2px solid #ddd', padding: '10px 8px', color: '#5a5c69' }}>Email</th>
                                <th style={{ borderBottom: '2px solid #ddd', padding: '10px 8px', color: '#5a5c69' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.map((a, i) => (
                                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                                    <td style={{ borderBottom: '1px solid #eee', padding: '10px 8px' }}>{a.user?.full_name || a.full_name || a.name || 'N/A'}</td>
                                    <td style={{ borderBottom: '1px solid #eee', padding: '10px 8px' }}>{a.user?.email || a.email || 'N/A'}</td>
                                    <td style={{ borderBottom: '1px solid #eee', padding: '10px 8px' }}><span style={{ background: (a.status === 'attended' || a.is_attended) ? '#1cc88a' : '#f6c23e', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{(a.status === 'attended' || a.is_attended) ? 'Attended' : 'Registered'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EventAttendees;