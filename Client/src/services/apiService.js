import { initializeApi } from "../config/apiConfig";

let api = null;

const ensureApiInitialized = async () => {
  if (!api) {
    api = await initializeApi();
  }
  return api;
};

// GET request
export const fetchData = async (endpoint, config = {}) => {
  try {
    const apiInstance = await ensureApiInitialized();
    const response = await apiInstance.get(endpoint, {
      ...config,
      withCredentials: true,
    });
    console.log(`GET ${endpoint} Response:`, response.data);
    return response; // Return full response object
  } catch (error) {
    console.error(`GET ${endpoint} Error:`, error.response?.data || error.message);
    throw error;
  }
};

// POST request
export const postData = async (endpoint, data, config = {}) => {
  try {
    const apiInstance = await ensureApiInitialized();
    const response = await apiInstance.post(endpoint, data, {
      ...config,
      withCredentials: true,
    });
    console.log(`POST ${endpoint} Response:`, response.data);
    return response;
  } catch (error) {
    console.error(`POST ${endpoint} Error:`, error.response?.data || error.message);
    throw error;
  }
};

// PATCH request
export const patchData = async (endpoint, data, config = {}) => {
  try {
    const apiInstance = await ensureApiInitialized();
    const response = await apiInstance.patch(endpoint, data, {
      ...config,
      withCredentials: true,
    });
    console.log(`PATCH ${endpoint} Response:`, response.data);
    return response;
  } catch (error) {
    console.error(`PATCH ${endpoint} Error:`, error.response?.data || error.message);
    throw error;
  }
};

// DELETE request
export const deleteData = async (endpoint, config = {}) => {
  try {
    const apiInstance = await ensureApiInitialized();
    const response = await apiInstance.delete(endpoint, {
      ...config,
      withCredentials: true,
    });
    console.log(`DELETE ${endpoint} Response:`, response.data);
    return response;
  } catch (error) {
    console.error(`DELETE ${endpoint} Error:`, error.response?.data || error.message);
    throw error;
  }
};