import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (authData) => {
    console.log('Login request data:', authData); // Add this to debug
    try {
      const response = await axios.post('http://localhost:9999/staff/login', authData, { withCredentials: true });
      console.log('Staff login response:', response.data); // Log response
      console.log('Staff logged in successfully');
      navigate('/dashboard/staff', { replace: true });
    } catch (error) {
      console.error('Error in staff login:', error.response ? error.response.data : error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:9999/auth/oauth/staff';
  };

  return (
    <div>
      <SuperAdminAuthFormView onSubmit={handleSubmit} onOAuth={handleOAuthLogin} userType="Staff Login" />
    </div>
  );
};

export default StaffLogin;