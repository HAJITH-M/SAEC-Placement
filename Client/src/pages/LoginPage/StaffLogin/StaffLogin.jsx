import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import { useNavigate } from 'react-router-dom';
import { fetchData, postData } from '../../../services/apiService';
import { getApiUrl } from '../../../config/apiConfig';

const StaffLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (authData) => {
    console.log('Login request data:', authData);
    try {
      // Send login request
      const loginResponse = await postData('/staff/login', authData, { 
        withCredentials: true,
        maxRedirects: 0,
      });
      console.log('Login Response:', loginResponse.status, loginResponse.headers);

      // Fetch session to verify cookie and get staff data
      console.log('Fetching session from /staff');
      const sessionResponse = await fetchData('/staff', {
        withCredentials: true,
      });
      console.log('Session Response:', sessionResponse.data);

      // Assuming sessionResponse.data contains staffId and role
      const { staffId, role } = sessionResponse.data;

      if (role !== 'staff') {
        throw new Error('Invalid session: Role mismatch');
      }

      if (!staffId) {
        throw new Error('Invalid session: Staff ID not found');
      }

      console.log('Staff login successful, staffId:', staffId);
      navigate('/dashboard/staff', { replace: true });
    } catch (error) {
      console.error('Error in staff login:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.details || 
        'Login failed. Please try again later.'
      );
    }
  };

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