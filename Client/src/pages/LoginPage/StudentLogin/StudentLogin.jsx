import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOAuthCallback = location.state?.fromOAuth; // Example: Set in OAuthSuccess.jsx

  const handleSubmit = async (authData) => {
    try {
      console.log('Login Request Data:', authData);
      const loginResponse = await axios.post(
        'http://localhost:9999/student/login',
        authData,
        { 
          withCredentials: true,
          maxRedirects: 0,
        }
      );
      console.log('Login Response:', loginResponse.status, loginResponse.headers);

      console.log('Fetching session from /student');
      const sessionResponse = await axios.get('http://localhost:9999/student', {
        withCredentials: true,
      });
      console.log('Session Response:', sessionResponse.data);

      const { studentId, userId, role } = sessionResponse.data;

      if (role !== 'student') {
        throw new Error('Invalid session: Role mismatch');
      }

      // Manual login: Require studentId; OAuth: Require userId
      if (isOAuthCallback) {
        if (!userId) {
          throw new Error('Invalid session: User ID not found for OAuth login');
        }
        console.log('OAuth login successful, userId:', userId);
      } else {
        if (!studentId) {
          throw new Error('Invalid session: Student ID not found for manual login');
        }
        console.log('Manual login successful, studentId:', studentId, 'userId:', userId);
      }

      navigate('/dashboard/student', { replace: true });
    } catch (error) {
      console.error('Error:', error.response ? error.response.status : 'No response', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.response?.data?.error || 'Login failed. Please try again later.');
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:9999/auth/oauth/student';
  };

  return (
    <div>
      <SuperAdminAuthFormView 
        onSubmit={handleSubmit} 
        onOAuth={handleOAuthLogin} 
        userType="Student Login" 
      />
    </div>
  );
};

export default StudentLogin;