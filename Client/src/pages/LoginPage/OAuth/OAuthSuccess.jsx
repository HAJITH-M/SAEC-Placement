import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchData } from '../../../services/apiService';
import { Loader2 } from 'lucide-react';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleOAuthCallback = async () => {
    if (hasRun.current) {
      console.log('Callback already executed, waiting for session');
      return; // Avoid redundant execution
    }

    const code = searchParams.get('code');
    const intendedRole = searchParams.get('intendedRole');
    const returnUrl = searchParams.get('returnUrl') || '/dashboard'; // Generic fallback
    console.log('OAuth Callback - Code:', code, 'Intended Role:', intendedRole, 'Return URL:', returnUrl);

    if (!code) {
      console.error('No OAuth code found in URL');
      setErrorMessage('Invalid OAuth request');
      setIsLoading(false);
      navigate(returnUrl, { replace: true });
      return;
    }

    hasRun.current = true;
    try {
      const response = await fetchData(
        `/auth/users/oauth/success?code=${code}&intendedRole=${intendedRole || 'student'}&returnUrl=${encodeURIComponent(returnUrl)}`,
        { withCredentials: true }
      );
      console.log('OAuth Response:', response.status, response.data);

      setSearchParams({}, { replace: true });
      if (response.status === 200 && response.data.success) {
        const { role, redirect, ...userDetails } = response.data;
        console.log('OAuth Success - Role:', role, 'Redirect:', redirect, 'User Details:', userDetails);
        navigate(redirect || `/dashboard/${role === 'super_admin' ? 'superadmin' : role}`, { replace: true });
      } else if (response.status === 401) {
        console.log('OAuth Failed - No active session');
        setErrorMessage('No active session after OAuth');
        navigate(returnUrl, { replace: true });
      } else {
        console.error('OAuth Failure:', response.data);
        setErrorMessage(response.data.message || 'Authentication failed');
        navigate(response.data.redirect || returnUrl, { replace: true });
      }
    } catch (error) {
      console.error('OAuth Error:', error);
      setErrorMessage('An error occurred during authentication');
      navigate(returnUrl, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleOAuthCallback();

    const interval = setInterval(async () => {
      try {
        const response = await fetchData('/auth/session', { withCredentials: true });
        if (response.status === 200 && response.data.success) {
          const { role } = response.data;
          console.log('Periodic Check - Role:', role);
          const redirectPath = `/dashboard/${role === 'super_admin' ? 'superadmin' : role}`;
          navigate(redirectPath, { replace: true });
          clearInterval(interval); // Stop polling once session is valid
        }
      } catch (error) {
        console.log('Session check failed:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (isLoading) {
    return <>
    <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    </>;
  }

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>}
      <div>Processing...</div>
    </div>
  );
};

export default OAuthSuccess;