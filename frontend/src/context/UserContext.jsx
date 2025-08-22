// context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

// IMPORTANT: global axios defaults
axios.defaults.withCredentials = true; // send cookies
const serverUrl = 'https://resumind.vercel.app';
axios.defaults.baseURL = serverUrl;

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [userState, setUserState] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    // indicates we've completed the initial auth check
    const [authChecked, setAuthChecked] = useState(false);

    const registerUser = async (e) => {
        e.preventDefault();
        if (!userState.email.includes('@') || !userState.password || userState.password.length < 6) {
            toast.error('Please enter a valid email and password (min 6 characters)');
            return;
        }
        try {
            await axios.post('/register', userState);
            toast.success('User registered successfully');
            setUserState({ name: '', email: '', password: '' });
            navigate('/login');
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
        }
    };

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            // login will set cookie on server (httpOnly). We rely on /login-status or /user to populate user.
            await axios.post('/login', { email: userState.email, password: userState.password });
            toast.success('User logged in successfully');
            setUserState({ email: '', password: '' });

            // Immediately confirm server-side session and populate user if available
            const status = await userLoginStatus();
            if (status.loggedIn && status.user) {
                setUser(status.user);
            } else {
                // fallback: try /user
                const fetched = await getUser();
                if (!fetched) {
                    toast.error('Could not fetch user after login. Please reload.');
                }
            }

            navigate('/');
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
        }
    };

    // returns the raw server response data (e.g. { loggedIn: true, user: {...} } or { loggedIn: false })
    const userLoginStatus = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/login-status'); // server now returns { loggedIn, user? }
            const data = res?.data || { loggedIn: false };
            if (data.loggedIn && data.user) {
                setUser(data.user);
            }
            setAuthChecked(true);
            setLoading(false);
            return data;
        } catch (error) {
            console.error('userLoginStatus error:', error);
            setAuthChecked(true);
            setLoading(false);
            return { loggedIn: false };
        }
    };

    const logoutUser = async () => {
        try {
            await axios.get('/logout');
            toast.success('User logged out successfully');
            setUser({});
            navigate('/login');
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
        }
    };

    const getUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/user');
            const usr = res.data || null;
            setUser(usr || {});
            setLoading(false);
            return usr;
        } catch (error) {
            setUser({});
            setLoading(false);
            return null;
        }
    };

    const updateUser = async (e, data) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.patch('/user', data);
            setUser(res.data);
            toast.success('User updated successfully');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
        }
    };

    // ... keep other functions (emailVerification, verifyUser, forgotPasswordEmail, resetPassword, changePassword, getAllUsers, deleteUser)
    // For brevity, reuse them from your original file unchanged, but ensure they use relative endpoints (e.g., '/verify-email').

    const emailVerification = async () => {
        setLoading(true);
        try {
            await axios.post('/verify-email');
            toast.success('Email verification sent successfully');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
        }
    };

    const verifyUser = async (token) => {
        setLoading(true);
        try {
            await axios.post(`/verify-user/${token}`);
            toast.success('User verified successfully');
            await getUser();
            setLoading(false);
            navigate('/');
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    const forgotPasswordEmail = async (email) => {
        setLoading(true);
        try {
            await axios.post('/forgot-password', { email });
            toast.success('Forgot password email sent successfully');
            setLoading(false);
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    const resetPassword = async (token, password) => {
        setLoading(true);
        try {
            await axios.post(`/reset-password/${token}`, { password });
            toast.success('Password reset successfully');
            setLoading(false);
            navigate('/login');
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);
        try {
            await axios.patch('/change-password', { currentPassword, newPassword });
            toast.success('Password changed successfully');
            setLoading(false);
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    const getAllUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/users');
            setAllUsers(res.data);
            setLoading(false);
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    const handlerUserInput = (name) => (e) => {
        const value = e.target.value;
        setUserState((prevState) => ({ ...prevState, [name]: value }));
    };

    const deleteUser = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/admin/users/${id}`);
            toast.success('User deleted successfully');
            setLoading(false);
            getAllUsers();
        } catch (error) {
            if (error.response) toast.error(error.response.data.message);
            else toast.error('Network error. Please try again.');
            setLoading(false);
        }
    };

    // INITIAL CHECK: on mount, run the auth status check and populate user if available
    useEffect(() => {
        const init = async () => {
            const status = await userLoginStatus();
            if (status.loggedIn) {
                // userLoginStatus already sets user if server returned it
                if (!status.user) {
                    // fallback: try /user
                    await getUser();
                }
            } else {
                setUser({});
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (user.role === 'admin') {
            getAllUsers();
        }
    }, [user.role]);

    const userValue = {
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
        loading,
        authChecked,
        getUser,
    };

    return <UserContext.Provider value={userValue}>{children}</UserContext.Provider>;
};
