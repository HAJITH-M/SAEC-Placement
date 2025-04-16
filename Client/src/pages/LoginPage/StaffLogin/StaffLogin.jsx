import React, { useEffect } from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import { useNavigate } from 'react-router-dom';
import { fetchData, postData } from '../../../services/apiService';
import { getApiUrl } from '../../../config/apiConfig';

const StaffLogin = () => {
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResponse = await fetchData('/staff', {
          withCredentials: true,
        });
        const { staffId, role } = sessionResponse.data;
        if (role === 'staff' && staffId) {
          console.log('Already authenticated, redirecting to dashboard');
          navigate('/dashboard/staff', { replace: true });
        }
      } catch (error) {
        console.log('No valid session found, staying on login:', error.message);
      }
    };
    checkSession();
  }, [navigate]);

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
      const baseUrl = await getApiUrl();
      const oauthUrl = `${baseUrl}/auth/oauth/staff`;
      console.log('Redirecting to OAuth URL:', oauthUrl);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Error determining OAuth URL:', error);
      window.location.href = 'http://localhost:9999/auth/oauth/staff';
    }
  };

  return (
    <div>
      <SuperAdminAuthFormView 
        onSubmit={handleSubmit} 
        onOAuth={handleOAuthLogin} 
        userType="staff" 
      />
    </div>
  );
};

export default StaffLogin;