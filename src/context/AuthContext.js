import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        const auth = sessionStorage.getItem('auth');

        if (savedUser && auth) {
            try {
                const userData = JSON.parse(savedUser);
                if (userData.email && userData.role) {
                    setUser(userData);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Erreur de parsing
            }
        }

        // Nettoyer les données invalides
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('auth');
        setUser(null);
        setLoading(false);
    }, []);

    const login = async (email, motDePasse) => {
        setLoading(true);
        try {
            const response = await api.get('/utilisateurs/me', {
                auth: { username: email, password: motDePasse }
            });
            const userData = response.data;
            setUser({ ...userData, email, motDePasse });
            sessionStorage.setItem('auth', JSON.stringify({ email, motDePasse }));
            sessionStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('auth');
        sessionStorage.removeItem('user');
    };

    const register = async (data) => {
        try {
            const response = await api.post('/utilisateurs/inscription', data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur lors de l\'inscription' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);