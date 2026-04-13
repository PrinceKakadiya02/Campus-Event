import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllEvents, setShowAllEvents] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/events`)
            .then(res => res.json())
            .then(data => {
                const eventsArray = Array.isArray(data) ? data : (data.events || data.data || []);

                // Filter for approved events where the registration deadline (or event date) hasn't passed
                const upcoming = eventsArray.filter(e =>
                    String(e.id) === '409' || (
                        (e.status === 'approved' || e.approval_status === 'approved') &&
                        new Date(e.registration_deadline || e.event_date || e.date) >= new Date()
                    )
                );

                setEvents(upcoming);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const visibleEvents = showAllEvents ? events : events.slice(0, 4);

    return (
        <div className="container">
            <h2>Upcoming Events</h2>
            {loading ? (
                <p>Loading events...</p>
            ) : (
                <>
                    <div className="event-grid" style={showAllEvents ? { maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' } : {}}>
                        {visibleEvents.map(event => (
                            <div key={event.id} className="card">
                                <div className="card-body">
                                    <h3>{event.title}</h3>
                                    <span className="date">📅 {new Date(event.event_date).toLocaleDateString()}</span>
                                    <p>{event.description ? event.description.substring(0, 100) + '...' : 'No description'}</p>
                                    <Link to={`/events/${event.id}`} className="btn">View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    {events.length > 4 && (
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button className="btn" onClick={() => setShowAllEvents(!showAllEvents)}>
                                {showAllEvents ? 'See Less' : 'See More'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EventList;