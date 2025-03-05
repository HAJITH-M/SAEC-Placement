import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (authData) => {
    try {
      // Make the POST request to the superadmin login endpoint
      const response = await axios.post('http://localhost:9999/superadmin/login', authData, { 
        withCredentials: true 
      });
      
      // Log success for debugging
      console.log('Super Admin login response:', response.data);

      // Since the backend redirects to "/superadmin" on success (302 status),
      // we don’t need to check response.data.success explicitly.
      // Instead, we rely on the request completing without error and manually navigate.
      console.log('Super Admin logged in successfully');
      navigate('/dashboard/superadmin', { replace: true });
    } catch (error) {
      // Handle errors similar to StudentLogin
      console.error('Error in super admin login:', error);
      const errorMessage = error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage); // This will be caught by the form component
    }
  };

  const handleOAuthLogin = () => {
    // OAuth flow remains unchanged as it’s working
    window.location.href = 'http://localhost:9999/auth/users/oauth';
  };

  return (
    <div>
      <SuperAdminAuthFormView 
        onSubmit={handleSubmit} 
        onOAuth={handleOAuthLogin} 
        userType="Super Admin Login" 
      />
    </div>
  );
};

export default SuperAdminLogin;