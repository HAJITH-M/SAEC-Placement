import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Install js-cookie: npm install js-cookie
import { fetchData } from '../../../services/apiService';

const ProtectedRoute = ({ allowedRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for cookies first
        const staffSession = Cookies.get('staff_session');
        const studentSession = Cookies.get('student_session');
        const superAdminSession = Cookies.get('admin_session');

        if (staffSession && allowedRole === 'staff') {
          setIsAuthenticated(true);
          navigate('/dashboard/staff');
          return;
        } else if (studentSession && allowedRole === 'student') {
          setIsAuthenticated(true);
          navigate('/dashboard/student');
          return;
        } else if (superAdminSession && allowedRole === 'super_admin') {
          setIsAuthenticated(true);
          navigate('/dashboard/superadmin');
          return;
        }

        // If no valid cookie, check the session via API
        const response = await fetchData('/auth/session', {
          withCredentials: true,
        });

        if (response.data.success && response.data.role === allowedRole) {
          setIsAuthenticated(true);
          // Set cookie based on role (optional, if API doesn't already set it)
          Cookies.set(`${allowedRole}_session`, response.data.userId, { expires: 1 }); // Expires in 1 day
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error.response ? error.response.data : error.message);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [allowedRole, navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const redirectPath = allowedRole === "super_admin" ? "/auth/superadmin" : `/auth/${allowedRole}`;
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;