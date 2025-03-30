import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchData } from '../../../services/apiService';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleOAuthCallback = async () => {
    if (hasRun.current) {
      console.log('Callback already executed, redirecting to default');
      navigate('/auth/superadmin', { replace: true });
      return;
    }

    const code = searchParams.get('code');
    const intendedRole = searchParams.get('intendedRole');
    const returnUrl = searchParams.get('returnUrl') || '/auth/superadmin';
    console.log('OAuth Callback - Code:', code, 'Intended Role:', intendedRole, 'Return URL:', returnUrl);

    if (!code) {
      console.error('No OAuth code found in URL');
      navigate(returnUrl, { replace: true });
      return;
    }

    hasRun.current = true;
    const response = await fetchData(
      `/auth/users/oauth/success?code=${code}&intendedRole=${intendedRole || 'super_admin'}&returnUrl=${encodeURIComponent(returnUrl)}`,
      { withCredentials: true }
    );
    console.log('OAuth Response:', response.status, response.data);

    setSearchParams({}, { replace: true });
    if (response.status === 200 && response.data.success) {
      const { role, redirect, ...userDetails } = response.data;
      console.log('OAuth Success - Role:', role, 'Redirect:', redirect, 'User Details:', userDetails);
      navigate(redirect, { replace: true });
    } else if (response.status === 401) {
      console.log('OAuth Failed - No active session');
      setErrorMessage('No active session after OAuth');
      navigate(returnUrl, { replace: true });
    } else {
      console.error('OAuth Failure:', response.data);
      setErrorMessage(response.data.message || 'Authentication failed');
      navigate(response.data.redirect || returnUrl, { replace: true });
    }
  };

  useEffect(() => {
    handleOAuthCallback();

    const interval = setInterval(async () => {
      const response = await fetchData('/auth/session', { withCredentials: true });
      if (response.status === 200 && response.data.success) {
        const { role } = response.data;
        console.log('Periodic Check - Role:', role);
        const redirectPath = `/dashboard/${role === 'super_admin' ? 'superadmin' : role}`;
        navigate(redirectPath, { replace: true });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>}
      <div>Loading...</div>
    </div>
  );
};

export default OAuthSuccess;