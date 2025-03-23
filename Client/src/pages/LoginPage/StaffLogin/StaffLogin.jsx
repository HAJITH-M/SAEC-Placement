import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchData, postData } from '../../../services/apiService';
import { getApiUrl } from '../../../config/apiConfig';

const StaffLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (authData) => {
    console.log('Login request data:', authData);
    try {
      // await axios.post('http://localhost:9999/staff/login', authData, { withCredentials: true });
      await postData('/staff/login', authData, { withCredentials: true });
      console.log('Staff logged in successfully');
      navigate('/dashboard/staff', { replace: true });
    } catch (error) {
      console.error('Error in staff login:', error.response ? error.response.data : error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  // const handleOAuthLogin = () => {
  //   window.location.href = 'http://localhost:9999/auth/oauth/staff';
  // };


  const handleOAuthLogin = async () => {
    try {
      const baseUrl = await getApiUrl(); // Get the dynamic base URL
      const oauthUrl = `${baseUrl}/auth/oauth/staff`;
      console.log('Redirecting to OAuth URL:', oauthUrl); // Debug
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Error determining OAuth URL:', error);
      // Fallback to production URL if determination fails
      window.location.href = 'https://your-production-api.com/auth/oauth/staff';
    }
  };


  return (
    <div>
      <SuperAdminAuthFormView 
        onSubmit={handleSubmit} 
        onOAuth={handleOAuthLogin} 
        userType="staff" 
        // Do not pass toggleAuthMode here
      />
    </div>
  );
};

export default StaffLogin;