// StaffLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../../components/AuthForm/AuthForm';

const StaffLogin = () => {
  const navigate = useNavigate();

  const onSubmit = (authData) => {
    // Check if the user's email domain matches staff email pattern
    if (!authData.user.email.endsWith('@saec.ac.in')) {
      alert('Please use a valid staff email address');
      return;
    }
    
    // Navigate to staff dashboard
    navigate('/staff-dashboard');
  };

  return <AuthForm userType="Staff" onSubmit={onSubmit} />;
};

export default StaffLogin;