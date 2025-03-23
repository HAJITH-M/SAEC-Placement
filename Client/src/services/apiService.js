import { initializeApi } from "../config/apiConfig";

let api = null;

const ensureApiInitialized = async () => {
  if (!api) {
    api = await initializeApi();
  }
  return api;
};

export const fetchData = async (endpoint, config = {}) => {
  const apiInstance = await ensureApiInitialized();
  try {
    const response = await apiInstance.get(endpoint, {
      ...config,
      withCredentials: true, // Ensure credentials are always sent
    });
    console.log('GET Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

  export const postData = async (endpoint, data, config = {}) => {
    const apiInstance = await ensureApiInitialized();
    try {
      const response = await apiInstance.post(endpoint, data, {
        ...config,
        withCredentials: true // Ensure credentials are sent
      });
      console.log('POST Response:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };