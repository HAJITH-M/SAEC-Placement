import { Link, useNavigate } from 'react-router-dom';
import { UserCircle2, Users, ShieldCheck, Home, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchData } from '../../services/apiService'; // Adjust path if needed

const AuthOptionPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true); // Track if session check is in progress
  const [hasSession, setHasSession] = useState(false); // Track if session exists

  // Initial session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchData('/check-session', { withCredentials: true });
        const { role } = response.data;
        setHasSession(true);
        if (role === 'admin') {
          navigate('/dashboard/superadmin', { replace: true });
        } else if (role === 'student') {
          navigate('/dashboard/student', { replace: true });
        } else if (role === 'staff') {
          navigate('/dashboard/staff', { replace: true });
        }
      } catch (err) {
        setHasSession(false); // No session, stay on /home
      } finally {
        setIsChecking(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Continuous guard only if no session initially detected
  useEffect(() => {
    if (hasSession) return; // Skip if session was found initially

    const interval = setInterval(async () => {
      try {
        const response = await fetchData('/check-session', { withCredentials: true });
        const { role } = response.data;
        setHasSession(true);
        if (role === 'admin') {
          navigate('/dashboard/superadmin', { replace: true });
        } else if (role === 'student') {
          navigate('/dashboard/student', { replace: true });
        } else if (role === 'staff') {
          navigate('/dashboard/staff', { replace: true });
        }
      } catch (err) {
        // Silent fail, no need to log repeatedly unless debugging
      }
    }, 5000); // Check every 5 seconds to reduce noise

    return () => clearInterval(interval);
  }, [navigate, hasSession]);


  // Render loading state while checking session
  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin" size={48} />
          </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-orange-50 to-white py-8">
      <div className="w-full max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-gray-900">
              Welcome to SAEC Campus Connect
            </h2>
            <p className="max-w-xl mt-4 text-sm md:text-base leading-relaxed text-gray-600">
              Choose your login type to continue
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-sm sm:max-w-none mx-auto">
            <Link
              to="/auth/student"
              className="flex flex-col items-center p-4 md:p-6 bg-white rounded-lg border-2 border-orange-500 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <UserCircle2 className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <span className="text-sm md:text-base font-semibold text-orange-500">Student Login</span>
            </Link>
            
            <Link
              to="/auth/staff"
              className="flex flex-col items-center p-4 md:p-6 bg-white rounded-lg border-2 border-orange-500 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <span className="text-sm md:text-base font-semibold text-orange-500">Staff Login</span>
            </Link>

            <Link
              to="/auth/superadmin"
              className="flex flex-col items-center p-4 md:p-6 bg-white rounded-lg border-2 border-orange-500 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <span className="text-sm md:text-base font-semibold text-orange-500">Admin Login</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/home"
            className="inline-flex items-center text-sm md:text-base font-medium text-orange-500 hover:text-orange-600 hover:scale-105 transform transition-all duration-200"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Go back to home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AuthOptionPage;