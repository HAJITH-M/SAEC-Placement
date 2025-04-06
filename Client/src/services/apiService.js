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
    return response; // Return full response object
  } catch (error) {
    // Return the error response instead of throwing, so the caller can handle it
    return error.response || { status: 500, data: { success: false, message: error.message } };
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
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { success: false, message: error.message } };
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
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { success: false, message: error.message } };
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
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { success: false, message: error.message } };
  }
};