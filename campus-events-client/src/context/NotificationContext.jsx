import React, { createContext, useState, useContext, useCallback } from 'react';
import '../components/Notification.css';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        // Fallback to alert if provider is missing
        return { notify: (msg) => alert(msg) };
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const notify = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="notification-container">
                {notifications.map(n => (
                    <div key={n.id} className={`notification notification-${n.type}`}>
                        <span>{n.message}</span>
                        <button onClick={() => removeNotification(n.id)} className="notification-close">&times;</button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};