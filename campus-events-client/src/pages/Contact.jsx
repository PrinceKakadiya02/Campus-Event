import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Contact = () => {
    const { notify } = useNotification();
    const { user } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [fetchingContacts, setFetchingContacts] = useState(false);

    // Fetch contacts if the user is an admin
    useEffect(() => {
        if (user && user.role === 'admin') {
            setFetchingContacts(true);
            fetch(`${API_BASE_URL}/admin/contacts`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success || data.data) {
                        setContacts(data.data || []);
                    } else {
                        notify(data.message || 'Failed to fetch contacts.', 'error');
                    }
                })
                .catch(err => {
                    console.error("Error fetching contacts:", err);
                    notify('Connection error while fetching contacts.', 'error');
                })
                .finally(() => setFetchingContacts(false));
        }
    }, [user, notify]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.status === 201 || response.ok) {
                notify(data.message || 'Message sent successfully!', 'success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else if (response.status === 400) {
                notify(data.message || 'Validation error. Please check your input.', 'error');
            } else {
                notify(data.message || 'An unexpected error occurred. Please try again.', 'error');
            }
        } catch (error) {
            console.error("Contact form submission error:", error);
            notify('Connection error. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (user && user.role === 'admin') {
        return (
            <div className="container">
                <h2 style={{ marginBottom: '30px' }}>Contact Inquiries</h2>
                {fetchingContacts ? (
                    <p>Loading inquiries...</p>
                ) : contacts.length === 0 ? (
                    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                        <p style={{ color: '#858796', margin: 0 }}>No contact inquiries found.</p>
                    </div>
                ) : (
                    <div className="event-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {contacts.map((contact) => (
                            <div key={contact.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{contact.subject || 'No Subject'}</h3>
                                    <div style={{ color: '#858796', fontSize: '0.9rem', marginBottom: '15px' }}>
                                        <p style={{ margin: '0 0 5px 0' }}>👤 <strong>{contact.name}</strong></p>
                                        <p style={{ margin: '0 0 5px 0' }}>📧 <a href={`mailto:${contact.email}`} style={{ color: '#4e73df', textDecoration: 'none' }}>{contact.email}</a></p>
                                        <p style={{ margin: '0' }}>📅 {new Date(contact.createdAt).toLocaleDateString()} {new Date(contact.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', fontSize: '0.95rem', color: '#5a5c69', whiteSpace: 'pre-wrap', flexGrow: 1 }}>
                                        {contact.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Contact Us</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} required />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="subject">Subject (Optional):</label>
                <input type="text" id="subject" value={formData.subject} onChange={handleChange} />

                <label htmlFor="message">Message:</label>
                <textarea id="message" value={formData.message} onChange={handleChange} required></textarea>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export default Contact;