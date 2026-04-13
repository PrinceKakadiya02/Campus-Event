import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; // Import the new CSS file

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false); // Close menu on logout
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Close menu when a link is clicked
    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header className="header">
            <nav className="navbar container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>CampusEvents</Link>
                <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}><span className="bar"></span><span className="bar"></span><span className="bar"></span></div>
                <div className={`nav-overlay ${isOpen ? 'active' : ''}`} onClick={closeMenu}></div>
                <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        <li className="nav-item"><Link to="/" className="nav-link" onClick={closeMenu}>Home</Link></li>
                        <li className="nav-item"><Link to="/events" className="nav-link" onClick={closeMenu}>Events</Link></li>
                        <li className="nav-item"><Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link></li>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li className="nav-item"><Link to="/admin" className="nav-link" onClick={closeMenu}>Admin</Link></li>
                                )}
                                {(user.role === 'organizer' || user.role === 'admin') && (
                                    <li className="nav-item"><Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link></li>
                                )}
                                <li className="nav-item"><Link to="/profile" className="nav-link" onClick={closeMenu}>Profile</Link></li>
                                <li className="nav-item"><button onClick={handleLogout} className="btn btn-logout">Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link></li>
                                <li className="nav-item"><Link to="/register" className="nav-link btn" onClick={closeMenu}>Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;