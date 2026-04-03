import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/src/context/UserContext';

export const ProtectedRoute: React.FC<{ role?: string }> = ({ role }) => {
  const { user, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
