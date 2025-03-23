import axios from 'axios';  // Add this at the top

const LOCAL_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:9999';
const PROD_URL = import.meta.env.VITE_PROD_API_URL || 'https://your-production-api.com/api';

async function checkLocalBackend() {
  try {
    await fetch(`${LOCAL_URL}`, {
      method: 'GET',
      mode: 'no-cors',
      timeout: 1000
    });
    return true;
  } catch (error) {
    return false;
  }
}

export const getApiUrl = async () => {
  if (import.meta.env.MODE === 'development') {
    const isLocalAvailable = await checkLocalBackend();
    return isLocalAvailable ? LOCAL_URL : PROD_URL;
  }
  return PROD_URL;
};

let apiInstance = null;

export const initializeApi = async () => {
  const baseURL = await getApiUrl();
  apiInstance = axios.create({
    baseURL,
  });
  return apiInstance;
};