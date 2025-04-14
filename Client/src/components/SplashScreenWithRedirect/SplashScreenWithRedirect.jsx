import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import SplashScreenView from '../SplashScreen/SplashScreenView';

const SplashScreenWithRedirect = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let timeoutId;

    const checkSession = async () => {
      try {
        const staffSession = Cookies.get('staff_session');
        const studentSession = Cookies.get('student_session');
        const superAdminSession = Cookies.get('admin_session') || Cookies.get('oauth_session');

        if (staffSession) {
          navigate('/dashboard/staff', { replace: true });
        } else if (studentSession) {
          navigate('/dashboard/student', { replace: true });
        } else if (superAdminSession) {
          navigate('/dashboard/superadmin', { replace: true });
        } else {
          // No session found: wait 5 seconds before redirecting to home
          timeoutId = setTimeout(() => {
            navigate('/home', { replace: true });
            setIsChecking(false);
          }, 5000);
          return;
        }
        setIsChecking(false);
      } catch (error) {
        console.error('Session check error:', error);
        // On error, wait 5 seconds before redirecting to home
        timeoutId = setTimeout(() => {
          navigate('/home', { replace: true });
          setIsChecking(false);
        }, 5000);
      }
    };

    checkSession();

    // Cleanup timeout on unmount to prevent memory leaks
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  if (isChecking) {
    return <SplashScreenView />;
  }

  return null; // Prevent rendering anything after redirect
};

export default SplashScreenWithRedirect;