import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../services/api';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const adminStatus = isAdmin();
        setIsAuthorized(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying admin access');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    // Logged in but not admin, redirect to dashboard
    toast.error('Admin access required');
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized admin, render children
  return children;
};

export default AdminRoute; 