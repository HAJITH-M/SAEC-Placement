import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchData } from '../../../services/apiService';

const ProtectedRoute = ({ allowedRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetchData('/auth/session', { withCredentials: true });

      // Check if response indicates a successful authentication
      if (response.status === 200 && response.data.success && response.data.role === allowedRole) {
        console.log('Protected Route Session Role:', response.data.role);
        setIsAuthenticated(true);
        // Set cookie if not already set by API
        Cookies.set(`${allowedRole}_session`, response.data.userId, { expires: 1 });
      } else {
        // Handle 401 or any other failure
        console.error('Session check failed:', response.status, response.data);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [allowedRole]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const redirectPath = allowedRole === 'super_admin' ? '/auth/superadmin' : `/auth/${allowedRole}`;
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;