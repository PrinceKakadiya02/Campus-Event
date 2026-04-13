import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

const OrganizerScanner = ({ eventId }) => {
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const isScanning = useRef(false);

    useEffect(() => {
        let scanner;

        // Use setTimeout to bypass React 18 Strict Mode double-render issue
        const timeoutId = setTimeout(() => {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            const handleScan = async (decodedText) => {
                if (decodedText && !isScanning.current) {
                    isScanning.current = true;
                    setStatusMessage({ text: 'Verifying ticket...', type: 'info' });

                    try {
                        const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendance`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ qrToken: decodedText })
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {
                            setStatusMessage({ text: data.message || 'Attendance marked successfully!', type: 'success' });
                        } else {
                            setStatusMessage({ text: data.message || 'Invalid or already scanned ticket.', type: 'error' });
                        }
                    } catch (err) {
                        setStatusMessage({ text: 'Connection error.', type: 'error' });
                    }

                    setTimeout(() => {
                        setStatusMessage({ text: '', type: '' });
                        isScanning.current = false;
                    }, 3000);
                }
            };

            const handleError = (err) => {
                // Ignore errors (usually no QR code found in current frame)
            };

            scanner.render(handleScan, handleError);
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [eventId]);

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', background: '#fff' }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
            </div>
            <div style={{ minHeight: '60px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {statusMessage.text && (
                    <div className={`btn`} style={{ width: '100%', cursor: 'default', backgroundColor: statusMessage.type === 'success' ? '#1cc88a' : statusMessage.type === 'error' ? '#e74a3b' : '#f6c23e', color: '#fff' }}>
                        {statusMessage.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerScanner;
