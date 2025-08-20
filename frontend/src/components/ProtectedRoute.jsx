// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = () => {
    const { user, authChecked } = useUser();

    // While the initial authentication check is running, show a loader.
    if (!authChecked) {
        return (
            <main className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="p-6 bg-white rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-700">Checking authentication...</p>
                </div>
            </main>
        );
    }

    // ⭐ FIX: Check for user._id instead of user.id
    if (user && user._id) {
        return <Outlet />;
    }

    // If the check is complete and there's no user, redirect to the login page.
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;