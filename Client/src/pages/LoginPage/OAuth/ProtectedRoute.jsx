import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true = authenticated, false = not authenticated

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Make a request to a backend endpoint to verify the session
        const response = await axios.get('http://localhost:9999/superadmin', {
          withCredentials: true, // Send cookies
        });
        if (response.data.success && response.data.role === 'super_admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading state while checking
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/superadmin" replace />;
};

export default ProtectedRoute;