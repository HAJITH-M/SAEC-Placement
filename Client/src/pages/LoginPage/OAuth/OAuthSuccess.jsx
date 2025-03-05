import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasRun = useRef(false);

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
      const response = await axios.get(`http://localhost:9999/auth/users/oauth/success?code=${code}&intendedRole=${intendedRole || 'super_admin'}&returnUrl=${encodeURIComponent(returnUrl || '/auth/superadmin')}`, {
        withCredentials: true,
      });
      console.log('OAuth response:', response.data);

      setSearchParams({}, { replace: true });
      if (response.data.success) {
        const { role, redirect, ...userDetails } = response.data;
        console.log('OAuth login successful for role:', role);
        // Log all user details in frontend console
        console.log('User Details (Frontend):', {
          userId: userDetails.userId,
          email: userDetails.email,
          full_name: userDetails.full_name,
          profile_pic: userDetails.profile_pic,
          metadata: userDetails.metadata,
          created_at: userDetails.created_at,
          last_sign_in_at: userDetails.last_sign_in_at,
          identities: userDetails.identities,
        });
        navigate(redirect, { replace: true });
      } else {
        console.error('OAuth response indicated failure:', response.data.message);
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

  return <div>Loading...</div>;
};

export default OAuthSuccess;