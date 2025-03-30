import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchData } from '../../../services/apiService';

const ProtectedRoute = ({ allowedRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetchData('/auth/session', { withCredentials: true });
      if (response.status === 200 && response.data.success && response.data.role === allowedRole) {
        console.log('Protected Route Session Role:', response.data.role);
        setIsAuthenticated(true);
        // Set cookie if not already set by API
        Cookies.set(`${allowedRole}_session`, response.data.userId, { expires: 1 });
        // Redirect to dashboard
        const dashboardPath = `/dashboard/${allowedRole === 'super_admin' ? 'superadmin' : allowedRole}`;
        navigate(dashboardPath, { replace: true });
      } else if (response.status === 401) {
        setIsAuthenticated(false); // No session, redirect to login
      } else {
        console.error('Session check failed with status:', response.status, response.data);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [allowedRole, navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const redirectPath = allowedRole === 'super_admin' ? '/auth/superadmin' : `/auth/${allowedRole}`;
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;