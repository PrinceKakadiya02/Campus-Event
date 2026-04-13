import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { API_BASE_URL } from '../config';
import Loader from './Loader';

const UserEventTicket = ({ eventId }) => {
    const [qrToken, setQrToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                // 1. Authentication Required: Extract token from cookies and send it via headers 
                // (matching the working approach in your EventDetails.jsx file)
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

                const response = await fetch(`${API_BASE_URL}/user/registrations/${eventId}/qr`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                    credentials: 'include'
                });
                const data = await response.json();

                // 3. Response Structure: Check success and set token
                if (response.ok && data.success) {
                    setQrToken(data.qrToken);
                } else {
                    // 4. Error Handling: Sets the 403 "Not registered for this event" message
                    setError(data.message || 'Failed to load ticket.');
                }
            } catch (err) {
                setError('Connection error while fetching ticket.', err);
            } finally {
                setLoading(false);
            }
        };

        // 2. Dynamic Event ID: Ensure eventId is valid before fetching
        if (eventId) {
            fetchQR();
        } else {
            setError("Invalid Event ID.");
            setLoading(false);
        }
    }, [eventId]);

    const downloadQR = () => {
        const canvas = document.getElementById("qr-canvas");
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `event-ticket-${eventId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><Loader /></div>;
    if (error) return <p style={{ color: '#e74a3b', textAlign: 'center', fontWeight: 'bold', padding: '20px' }}>{error}</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #eaecf4' }}>
            <h3 style={{ marginBottom: '20px', color: '#4e73df' }}>Your Entry Ticket</h3>
            <div style={{ padding: '15px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {qrToken ? <QRCodeCanvas id="qr-canvas" value={qrToken} size={220} /> : <p>No token available.</p>}
            </div>
            {qrToken && (
                <button onClick={downloadQR} className="btn" style={{ marginTop: '20px', backgroundColor: '#1cc88a', width: '100%', maxWidth: '250px' }}>
                    ⬇ Download Ticket
                </button>
            )}
            <p style={{ marginTop: '20px', color: '#858796', fontSize: '0.9rem', textAlign: 'center' }}>Present this QR code to the organizer at the entrance.</p>
        </div>
    );
};

export default UserEventTicket;