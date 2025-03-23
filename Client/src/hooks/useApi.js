import { useState, useEffect } from 'react';
import { initializeApi } from '../config/apiConfig';

export const useApi = () => {
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const apiInstance = await initializeApi();
        setApi(apiInstance);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return { api, loading, error };
};