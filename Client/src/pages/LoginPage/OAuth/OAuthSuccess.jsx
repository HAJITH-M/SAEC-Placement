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
    console.log('Handling OAuth callback with code:', code);

    if (!code) {
      console.error('No OAuth code found in URL');
      navigate('/superadmin/login', { replace: true });
      return;
    }

    hasRun.current = true;
    try {
      const response = await axios.get(`http://localhost:9999/auth/users/oauth/success?code=${code}`, {
        withCredentials: true,
      });
      console.log('OAuth response:', response);
      console.log('OAuth response data:', response.data);

      if (response.data.success) {
        const { role } = response.data;
        console.log('OAuth login successful for role:', role);
        setSearchParams({}, { replace: true });
        if (role === 'super_admin') {
          navigate('/dashboard/superadmin', { replace: true });
        } else if (role === 'staff') {
          navigate('/dashboard/staff', { replace: true });
        } else {
          navigate('/dashboard/student', { replace: true });
        }
      } else {
        console.error('OAuth response indicated failure:', response.data.message);
        navigate('auth/superadmin', { replace: true });
      }
    } catch (error) {
      console.error('OAuth callback error:', error.response ? error.response.data : error.message);
      setSearchParams({}, { replace: true });
      navigate('auth/superadmin', { replace: true });
    }
  };

  useEffect(() => {
    handleOAuthCallback();
  }, []); // Empty deps to run once on mount

  return <div>Loading...</div>;
};

export default OAuthSuccess;