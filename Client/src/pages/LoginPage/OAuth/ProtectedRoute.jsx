import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { fetchData } from '../../../services/apiService';

const ProtectedRoute = ({ allowedRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log(`Checking session for role: ${allowedRole}`);
        const response = await fetchData('/auth/session', {
          withCredentials: true,
        });
        console.log('Session response:', response.data);

        if (response.data.success && response.data.role === allowedRole) {
          console.log(`Session valid for ${allowedRole}, userId: ${response.data.userId}`);
          setIsAuthenticated(true);
        } else {
          console.error(`Role mismatch or invalid session: expected ${allowedRole}, got ${response.data.role || 'none'}`);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error.response ? error.response.data : error.message);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [allowedRole]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const redirectPath = allowedRole === "super_admin" ? "/auth/superadmin" : `/auth/${allowedRole}`;
  console.log(`Authentication status: ${isAuthenticated}, redirecting to: ${redirectPath}`);
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;