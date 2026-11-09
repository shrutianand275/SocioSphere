import { createContext, useContext, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    // LOGIN
    const login = async (credentials) => {

        setLoading(true);

        try {

            const response = await API.post('/auth/login', credentials);

            const { token, user } = response.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            setUser(user);

            return {
                success: true,
                user
            };

        } catch (error) {

            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };

        } finally {

            setLoading(false);

        }

    };


    // REGISTER
    const register = async (userData) => {

        setLoading(true);

        try {

            const response = await API.post('/auth/register', userData);

            return {
                success: true,
                message: response.data.message
            };

        } catch (error) {

            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };

        } finally {

            setLoading(false);

        }

    };


    // LOGOUT
    const logout = () => {

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        setUser(null);

    };


    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


export const useAuth = () => useContext(AuthContext);