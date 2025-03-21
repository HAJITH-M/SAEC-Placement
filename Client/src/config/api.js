import axios from 'axios';

const API_URL = 'http://localhost:9999';

import { supabaseConfig as supabase } from './SupabaseConfig';

export const forgotPassword = async (role, email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:5173/auth/${role}/reset-password?useQuery=true&useQuery=true`
        });

        if (error) {
            console.error('Supabase Magic Link Error:', error);
            throw { message: error.message || 'Failed to send reset link', status: 400 };
        }

        return { message: 'Check your email for the reset link.' };
    } catch (error) {
        console.error('Forgot Password Error:', error);
        throw {
            message: error?.message || 'Failed to send reset link',
            status: error?.status || 500
        };
    }
};


export const resetPassword = async (role, token, newPassword) => {
    const endpoint = role === 'student' ? '/student/reset-password' : '/staff/reset-password';
  
    try {
      console.log('Making request to:', `${API_URL}${endpoint}`); 
      console.log('Payload:', { token, newPassword });  
  
      const response = await axios.post(`${API_URL}${endpoint}`, {
        token,                   
        newPassword             
      });
  
      return response.data;
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw {
        message: error?.response?.data?.error || 'Failed to reset password',
        status: error?.response?.status || 500
      };
    }
  };
  

