import React, { useState } from 'react';
import { forgotPassword } from '../../../config/api';
import { toast,ToastContainer } from 'react-toastify';

const StudentForgotPassword = () => {
  const [email, setEmail] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword('student', email);
      toast.success(response.message || 'Check your email for reset link.');
    } catch (error) {
      toast.info(error.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="forgot-password student">
      <h2>Student Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your student email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button onClick={handleSubmit}>Send Reset Link</button>
      <ToastContainer />
    </div>
  );
};

export default StudentForgotPassword;
