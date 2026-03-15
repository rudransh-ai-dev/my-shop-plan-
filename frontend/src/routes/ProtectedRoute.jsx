import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Since Layout encapsulates all protected routes
    return <Outlet />;
};

export default ProtectedRoute;
