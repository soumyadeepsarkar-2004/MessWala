import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('messwala_token');
            const savedUser = localStorage.getItem('messwala_user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));

                try {
                    const res = await api.get('/auth/profile');
                    if (res.data.success) {
                        setUser(res.data.user);
                        localStorage.setItem('messwala_user', JSON.stringify(res.data.user));
                    }
                } catch (err) {
                    console.error('Failed to verify token:', err);
                    if (err.response?.status === 401) {
                        localStorage.removeItem('messwala_token');
                        localStorage.removeItem('messwala_user');
                        setToken(null);
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const saveAuth = (newToken, userData) => {
        localStorage.setItem('messwala_token', newToken);
        localStorage.setItem('messwala_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const googleLogin = async (credential, captchaToken) => {
        const res = await api.post('/auth/google', { credential, captchaToken });
        const { token: newToken, user: userData } = res.data;
        saveAuth(newToken, userData);
        return res.data;
    };

    const adminLogin = async (email, password) => {
        const res = await api.post('/auth/admin/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        saveAuth(newToken, userData);
        return res.data;
    };

    const updateUser = (userData) => {
        localStorage.setItem('messwala_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('messwala_token');
        localStorage.removeItem('messwala_user');
        setToken(null);
        setUser(null);
    };

    const isRole = (...roles) => roles.includes(user?.role);

    return (
        <AuthContext.Provider
            value={{ user, token, loading, googleLogin, adminLogin, updateUser, logout, isRole }}
        >
            {children}
        </AuthContext.Provider>
    );
};
