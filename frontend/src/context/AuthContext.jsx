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
        const savedToken = localStorage.getItem('messwala_token');
        const savedUser = localStorage.getItem('messwala_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;

        localStorage.setItem('messwala_token', newToken);
        localStorage.setItem('messwala_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await api.post('/auth/register', data);
        const { token: newToken, user: userData } = res.data;

        localStorage.setItem('messwala_token', newToken);
        localStorage.setItem('messwala_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
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
            value={{ user, token, loading, login, register, logout, isRole }}
        >
            {children}
        </AuthContext.Provider>
    );
};
