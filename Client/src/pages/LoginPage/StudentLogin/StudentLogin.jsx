import React, { useState } from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [isRegistration, setIsRegistration] = useState(false);

  const handleSubmit = async (authData) => {
    const endpoint = isRegistration ? '/student/signup' : '/student/login'; // Define endpoint here
    try {
      console.log(`${isRegistration ? 'Registration' : 'Login'} Request Data:`, authData);
      const authResponse = await axios.post(
        `http://localhost:9999${endpoint}`,
        authData,
        { 
          withCredentials: true,
          maxRedirects: 0,
        }
      );
      console.log(`${isRegistration ? 'Registration' : 'Login'} Response:`, authResponse.status, authResponse.headers);

      console.log('Fetching session from /student');
      const sessionResponse = await axios.get('http://localhost:9999/student', {
        withCredentials: true,
      });
      console.log('Session Response:', sessionResponse.data);

      const { studentId, role } = sessionResponse.data;

      if (role !== 'student') {
        throw new Error('Invalid session: Role mismatch');
      }

      if (!studentId) {
        throw new Error('Invalid session: Student ID not found');
      }

      console.log(`${isRegistration ? 'Registration' : 'Login'} successful, studentId:`, studentId);
      navigate('/dashboard/student', { replace: true });
    } catch (error) {
      console.error('Full error response:', error.response?.data);
      if (error.response?.status === 400) {
        throw new Error(`Invalid ${isRegistration ? 'registration' : 'login'} data. Please check your inputs.`);
      }
      if (error.response?.status === 409 && isRegistration) {
        throw new Error('Student already registered with this email.');
      }
      if (error.response?.status === 401 && !isRegistration) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(
        error.response?.data?.details || 
        error.response?.data?.error || 
        `${isRegistration ? 'Registration' : 'Login'} failed. Please try again later.`
      );
    }
  };

  const handleOAuth = () => {
    if (!isRegistration) {
      window.location.href = 'http://localhost:9999/auth/oauth/student';
    }
  };

  const toggleAuthMode = () => {
    setIsRegistration((prev) => !prev);
  };

  return (
    <div>
      <SuperAdminAuthFormView 
        onSubmit={handleSubmit} 
        onOAuth={handleOAuth}
        userType={isRegistration ? 'Student Registration' : 'Student Login'} 
        toggleAuthMode={toggleAuthMode} // Pass the toggle function
      />
    </div>
  );
};

export default StudentLogin;