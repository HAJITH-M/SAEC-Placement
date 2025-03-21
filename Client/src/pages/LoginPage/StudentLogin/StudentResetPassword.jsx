import React, { useState, useEffect } from 'react';
import { resetPassword } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Lock, KeyRound } from 'lucide-react';

const StudentResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    console.log("Raw hash:", hash);

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");

    console.log("Extracted Token:", accessToken);

    if (accessToken) {
      setToken(accessToken);
    } else {
      console.log("Invalid or missing token");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      console.log("Invalid or missing token");
      return;
    }

    try {
      const response = await resetPassword('student', token, newPassword);
      console.log("Reset Password Response:", response);
      toast.success(response.message || 'Password updated successfully!');

      setTimeout(() => {
        toast.success("redirecting to login page now");
        navigate("/auth/student");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || 'Failed to reset password.');
    }
  };

  return (
    <section className="h-screen flex items-center bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:items-stretch md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                <Lock className="inline-block mr-2 h-8 w-8" />
                Reset Your Password
              </h2>
              <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
                Enter your new student password below to reset your account
              </p>
            </div>
          </div>
          <div className="lg:pl-12">
            <div className="overflow-hidden bg-white rounded-md">
              <div className="p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-base font-medium text-gray-900">
                      <KeyRound className="inline-block mr-2 h-5 w-5" />
                      New Password
                    </label>
                    <div className="mt-2 relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder="Enter your new password"
                        required
                      />
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:bg-orange-600 focus:bg-orange-600"
                    >
                      <Lock className="mr-2 h-5 w-5" />
                      Reset Password
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

export default StudentResetPassword;