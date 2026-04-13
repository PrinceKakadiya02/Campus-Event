import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <section className="intro">
                <h2>Welcome to the Event Management System</h2>
                <p>
                    Our platform makes it simple to discover and manage campus events. Whether
                    you’re a student looking to participate or an organizer managing multiple
                    competitions, this system streamlines everything in one place.
                </p>
                <Link to="/events" className="btn">Explore Events</Link>
            </section>

            <section className="features">
                <div className="card" style={{ padding: '20px' }}>
                    <h3>📅 Event Scheduling</h3>
                    <p>Easily view upcoming campus events and plan your participation.</p>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <h3>📝 Registration</h3>
                    <p>Register for events online and get instant confirmation.</p>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <h3>📊 Event Tracking</h3>
                    <p>Track ongoing events, schedules, and results in real-time.</p>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                    <h3>🤝 Collaboration</h3>
                    <p>Connect with event organizers and other students seamlessly.</p>
                </div>
            </section>
        </>
    );
};

export default Home;