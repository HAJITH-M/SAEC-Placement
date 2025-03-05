import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (authData) => {
    try {
      const response = await axios.post('http://localhost:9999/student/login', authData, { withCredentials: true });
      if (response.data.success) {
        console.log('Student logged in successfully');
        navigate('/dashboard/student', { replace: true });
      }
    } catch (error) {
      console.error('Error in student login:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:9999/auth/oauth/student';
  };

  return (
    <div>
      <SuperAdminAuthFormView onSubmit={handleSubmit} onOAuth={handleOAuthLogin} userType="Student Login" />
    </div>
  );
};

export default StudentLogin;