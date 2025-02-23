import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../../components/AuthForm/AuthForm';

const StudentLogin = () => {
  const navigate = useNavigate();

  const handleStudentLogin = async ({ email, password }) => {
    try {
      // Remove manual check since zod already validates it
  
      // Here you would typically make an API call to authenticate the user
      // For now, we'll just simulate it
      if (!password || password.length < 6) {
        throw new Error('Invalid password. Please try again.');
      }
  
      // Store the email in localStorage
      localStorage.setItem('studentEmail', email);
  
      // If authentication is successful, navigate to dashboard
      navigate('/dashboard/student');
    } catch (error) {
      // This error will now be properly displayed in the AuthForm
      throw error;
    }
  };
  
  return <AuthForm userType="Student" onSubmit={handleStudentLogin} />;
};

export default StudentLogin;