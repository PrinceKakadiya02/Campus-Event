import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { notify } = useNotification();

    const fetchProfile = async () => {
        try {
            // Extract token from cookie if needed for Authorization header
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('http://localhost:8800/auth/profile', {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                    localStorage.removeItem('user');
                }
            }
            // Fetch fresh profile data using the token
            await fetchProfile();
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        // Fetch full profile to ensure we have all details (like full_name)
        await fetchProfile();
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:8800/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
        // Clear token cookie
        document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
        localStorage.removeItem('user');
        setUser(null);
        notify('Logged out successfully', 'info');
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);