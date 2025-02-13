// StudentLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../../components/AuthForm/AuthForm';

const StudentLogin = () => {
  const navigate = useNavigate();

  const onSubmit = (authData) => {
    // Check if the user's email domain matches student email pattern
    if (!authData.user.email.endsWith('@saec.ac.in')) {
      alert('Please use a valid student email address');
      return;
    }
    
    // Navigate to student dashboard
    navigate('/student-dashboard');
  };

  return <AuthForm userType="Student" onSubmit={onSubmit} />;
};

export default StudentLogin;
