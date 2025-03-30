import { supabaseConfig as supabase } from './SupabaseConfig';
import { postData } from '../services/apiService';
import { getApiUrl } from './apiConfig';
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ; // Use environment variable
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL ; // Use environment variable

export const forgotPassword = async (role, email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:5173/auth/${role}/reset-password?useQuery=true&useQuery=true`
        });

        if (error) {
            console.error('Supabase Magic Link Error:', error);
            throw { message: error.message || 'Failed to send reset link', status: 400 };
        }

        return { message: 'Check your email for the reset link.' };
    } catch (error) {
        console.error('Forgot Password Error:', error);
        throw {
            message: error?.message || 'Failed to send reset link',
            status: error?.status || 500
        };
    }
};


export const resetPassword = async (role, token, newPassword) => {
    const endpoint = role === 'student' ? '/student/reset-password' : '/staff/reset-password';
  
    try {
      const baseUrl = await getApiUrl();
      console.log('Making request to:', `${baseUrl}${endpoint}`); 
      console.log('Payload:', { token, newPassword });  
  
      const response = await postData(`${endpoint}`, {
        token,                   
        newPassword             
      });
  
      return response.data;
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw {
        message: error?.response?.data?.error || 'Failed to reset password',
        status: error?.response?.status || 500
      };
    }
  };
  

  let geminiApi = null;
  
  const initializeGeminiApi = () => {
    if (!geminiApi) {
      geminiApi = axios.create({
        baseURL: GEMINI_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
    }
    return geminiApi;
  };
  
  // POST request for Gemini API
  export const postGeminiData = async (data, config = {}) => {
    try {
      const apiInstance = initializeGeminiApi();
      
      const response = await apiInstance.post(
        `?key=${GEMINI_API_KEY}`,
        data,
        {
          ...config,
        }
      );
      
      console.log('POST Gemini API Response:', response.data);
      return response; // Return full response object
    } catch (error) {
      console.error('POST Gemini API Error:', error.response?.data || error.message);
      throw error;
    }
  };
  
  // Utility function to generate content with retry logic
  export const generateContent = async (prompt, retries = 3, delayMs = 1000) => {
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        const response = await postGeminiData({
          contents: [{
            parts: [{ text: prompt }]
          }]
        });
        
        return response;
      } catch (error) {
        attempt++;
        if (attempt === retries) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        console.log(`Retrying (${attempt}/${retries}) after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt))); // Exponential backoff
      }
    }
  };
  
  // Utility function to parse Gemini response
  export const parseGeminiResponse = (response) => {
    try {
      const rawText = response.data.candidates[0].content.parts[0].text;
      let cleanedText = rawText.trim();
      
      // Remove markdown if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText
          .replace('```json', '')
          .replace(/```$/g, '')
          .trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText
          .replace(/^```/, '')
          .replace(/```$/g, '')
          .trim();
      }
      
      const jsonMatch = cleanedText.match(/({[\s\S]*})/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1];
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error.message);
      throw new Error(`Response parsing failed: ${error.message}`);
    }
  };
  