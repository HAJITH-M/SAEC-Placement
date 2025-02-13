import { Link } from 'react-router-dom';

const AuthOptionPage = () => {
  return (
    <section className="h-screen flex items-center bg-white">
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Welcome to SAEC Campus Connect
          </h2>
          <p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
            Choose your login type to continue
          </p>
        </div>
        
        <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/auth/student"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:bg-orange-600 focus:bg-orange-600"
          >
            Student Login
          </Link>
          
          <Link
            to="/auth/staff"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-orange-500 transition-all duration-200 bg-white border-2 border-orange-500 rounded-md focus:outline-none hover:bg-orange-50 focus:bg-orange-50"
          >
            Staff Login
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/home"
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            ← Go back to home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AuthOptionPage;