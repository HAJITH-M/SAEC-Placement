import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../zodSchema/AuthSchema';
import { useState } from 'react';

const AuthForm = ({ onSubmit, userType }) => {
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      await onSubmit({
        email: data.email,
        password: data.password
      });
    } catch (error) {
      setAuthError(error.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="h-screen flex items-center bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:items-stretch md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Welcome Back to Login {userType}!
              </h2>
              <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
                Access your {userType.toLowerCase()} dashboard
              </p>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="overflow-hidden bg-white rounded-md">
              <div className="p-6">
                {authError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {authError}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmitForm)}>
                  <div>
                    <label className="text-base font-medium text-gray-900">College Email</label>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        {...register('email')}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder={`Enter your ${userType.toLowerCase()} email`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-base font-medium text-gray-900">Password</label>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        {...register('password')}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder="Enter your password"
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>
                  <div className="flex justify-end">
                    <a href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:bg-orange-600 focus:bg-orange-600 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Welcome to {userType.toLowerCase()} login
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthForm;