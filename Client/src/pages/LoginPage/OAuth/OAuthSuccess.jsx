import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { fetchData } from '../../../services/apiService';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [errorMessage, setErrorMessage] = useState(null); // Added for error display

  const handleOAuthCallback = async () => {
    if (hasRun.current) {
      console.log('Callback already executed, skipping');
      return;
    }

    const code = searchParams.get('code');
    const intendedRole = searchParams.get('intendedRole');
    const returnUrl = searchParams.get('returnUrl');
    console.log('Handling OAuth callback with code:', code, 'Intended role:', intendedRole, 'Return URL:', returnUrl);

    if (!code) {
      console.error('No OAuth code found in URL');
      navigate(returnUrl || '/auth/superadmin', { replace: true });
      return;
    }

    hasRun.current = true;
    try {
      const response = await fetchData(
        `/auth/users/oauth/success?code=${code}&intendedRole=${intendedRole || 'super_admin'}&returnUrl=${encodeURIComponent(returnUrl || '/auth/superadmin')}`,
        { withCredentials: true }
      );
      console.log('OAuth response:', response.data);

      setSearchParams({}, { replace: true });
      if (response.data.success) {
        const { role, redirect, ...userDetails } = response.data;
        console.log('OAuth login successful for role:', role, 'Redirecting to:', redirect);
        console.log('User Details (Frontend):', userDetails);
        navigate(redirect, { replace: true });
      } else {
        console.error('OAuth response indicated failure:', response.data);
        setErrorMessage(response.data.message); // Set error message from backend
        navigate(response.data.redirect, { replace: true });
      }
    } catch (error) {
      console.error('OAuth callback error:', error.response ? error.response.data : error.message);
      setSearchParams({}, { replace: true });
      navigate(returnUrl || '/auth/superadmin', { replace: true });
    }
  };

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>} {/* Display error if present */}
      <div>Loading...</div>
    </div>
  );
};

export default OAuthSuccess;