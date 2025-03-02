// StaffLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../../components/AuthForm/AuthForm';
import axios from 'axios';

const StaffLogin = () => {
  const navigate = useNavigate();
  
  const handleStaffLogin = async (authData) => {
    try {
      const response = await axios.post('http://localhost:9999/staff/login', {
        ...authData // Spread the authData object directly
      }, { withCredentials: true });
      
      console.log(response);
      if (response.data.success) {
        console.log('Staff logged in successfully');
        navigate('/dashboard/staff');
      }
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to be caught by AuthForm
    }
  };

  // Pass the function reference, not the function execution
  return <AuthForm userType="Staff" onSubmit={handleStaffLogin} />;
};

export default StaffLogin;