import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthForm from '../../../components/AuthForm/AuthForm';

const StudentLogin = () => {
  const navigate = useNavigate();

  const handleStudentLogin = async (credentials) => {
    try {
      const response = await axios.post(
        'http://localhost:9999/student/login',
        {
          email: credentials.email,
          password: credentials.password,
        },
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 302) {
        navigate('/dashboard/student', { replace: true });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleOAuthLogin = async () => {
    try {
      // Redirect to OAuth endpoint
      window.location.href = 'http://localhost:9999/auth/oauth/student';
    } catch (error) {
      console.error('OAuth initiation error:', error);
    }
  };

  return (
    <div>
      <AuthForm userType="Student" onSubmit={handleStudentLogin} />
      <div className="text-center mt-4">
        <button
          onClick={handleOAuthLogin}
          className="inline-flex items-center justify-center px-4 py-2 text-base font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;