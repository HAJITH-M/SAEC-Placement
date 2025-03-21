import React, { useState } from 'react';
import { forgotPassword } from '../../../config/api';
import { toast,ToastContainer } from 'react-toastify';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';

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
    <section className="h-screen flex items-center bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:items-stretch md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">Reset Your Password</h2>
              <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
                Enter your student email address and we'll send you a link to reset your password
              </p>
            </div>
          </div>
          <div className="lg:pl-12">
            <div className="overflow-hidden bg-white rounded-md">
              <div className="p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-base font-medium text-gray-900">Student Email</label>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder="Enter your student email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:bg-orange-600 focus:bg-orange-600"
                    >
                      Send Reset Link <FaPaperPlane className="ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default StudentForgotPassword;