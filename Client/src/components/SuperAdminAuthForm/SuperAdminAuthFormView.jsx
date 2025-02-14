import React from 'react';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import SuperAdminAuthFormVM from './SuperAdminAuthFormVM';
// import AuthFormVM from './AuthFormVM';

const SuperAdminAuthFormView = (props) => {
  const vm = SuperAdminAuthFormVM(props);

  return (
    <section className="h-screen flex items-center bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:items-stretch md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Welcome Back Super Admin!
              </h2>
              <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
                Access your super admin dashboard
              </p>
            </div>
          </div>

          <div className="lg:pl-12">
            <div className="overflow-hidden bg-white rounded-md">
              <div className="p-6">
                {vm.authError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {vm.authError}
                  </div>
                )}
                <form className="space-y-4" onSubmit={vm.handleSubmit(vm.onSubmitForm)}>
                  <div>
                    <label className="text-base font-medium text-gray-900">Email</label>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        {...vm.register('email')}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    {vm.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{vm.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-base font-medium text-gray-900">Password</label>
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        {...vm.register('password')}
                        className="block w-full px-10 py-3 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 caret-orange-500"
                        placeholder="Enter your password"
                      />
                    </div>
                    {vm.errors.password && (
                      <p className="mt-1 text-sm text-red-600">{vm.errors.password.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <a href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:bg-orange-600 focus:bg-orange-600"
                    >
                      Sign in
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Super Admin Access Only
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

export default SuperAdminAuthFormView;