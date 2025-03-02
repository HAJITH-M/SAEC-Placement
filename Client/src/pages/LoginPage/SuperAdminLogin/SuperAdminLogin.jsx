import React from 'react';
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    
   const handleSubmit = async (authData) => {
  try {
    const response = await axios.post(
      'http://localhost:9999/superadmin/login',
      authData,
      { withCredentials: true }
    );

    console.log('Super Admin login response:', response);
    if (response.data.success) {
      console.log('Super Admin logged in successfully');
      navigate('/dashboard/superadmin');
      //  window.location.href = "http://localhost:5173/superadmin"
    }
  } catch (error) {
    console.error('Error in super admin login:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid credentials');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw new Error('Login failed');
  }
};


const handleOAuthLogin = () => {
  window.location.href = 'http://localhost:9999/auth/users/oauth'; // Redirect to backend OAuth endpoint
};

    return (
        <div>
            <SuperAdminAuthFormView 
                onSubmit={handleSubmit} 
                userType="Super Admin Login" 
            />
        </div>
    );
};

export default SuperAdminLogin;