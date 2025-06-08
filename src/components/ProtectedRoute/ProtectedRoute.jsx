import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../services/api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userIsAdmin = isAdmin();

  if (!token) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !userIsAdmin) {
    // User is not an admin, redirect to user dashboard
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 