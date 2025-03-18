import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999';
const GEMINI_API_KEY = 'AIzaSyAdqUZ6j42IST9GA2jCdPn-zao4NSH4l3Q'; // Replace with your real API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const AdminJobPost = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    driveDate: '',
    expiration: '',
    batch: '',
    department: [],
    driveLink: '',
  });
  const [rawDescription, setRawDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData({ ...formData, [name]: value.split(',').map(d => d.trim()).filter(d => d) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formatDateForBackend = (dateStr, includeTime = false) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (includeTime) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        return date.toISOString().split('T')[0];
      }
    } catch (err) {
      console.error('Date formatting error:', err.message);
      return dateStr;
    }
  };

  const formatDateForInput = (dateStr) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (err) {
      console.error('Date formatting for input error:', err.message);
      return dateStr;
    }
  };
  
  // Function to add delay between requests
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const makeApiRequest = async (prompt, currentRetry = 0) => {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        }
      );
      
      return response.data;
    } catch (err) {
      console.error(`API Request failed (attempt ${currentRetry + 1}):`, err.message);
      
      if (currentRetry < MAX_RETRIES - 1) {
        // Wait longer between each retry
        const waitTime = Math.pow(2, currentRetry) * 1000;
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        return makeApiRequest(prompt, currentRetry + 1);
      }
      
      throw err;
    }
  };

  const analyzeJobDescription = async (description) => {
    if (!description) {
      setError(null);
      setFormData({
        companyName: '',
        jobDescription: '',
        driveDate: '',
        expiration: '',
        batch: '',
        department: [],
        driveLink: '',
      });
      return;
    }

    try {
      setLoading(true);
      setRetryCount(0);
      
      const prompt = `
        Extract the following fields from the job description below and return them in JSON format:
        - companyName (string)
        - jobDescription (string)
        - driveDate (string, MM/DD/YYYY)
        - expiration (string, MM/DD/YYYY hh:mm AM/PM)
        - batch (string)
        - department (array of strings)
        - driveLink (string, URL)
        
        Return only valid JSON without any markdown formatting or explanations.
        
        Job Description: ${description}
      `;

      const responseData = await makeApiRequest(prompt);
      console.log('Raw API Response:', responseData);

      let aiData;
      try {
        // Get the raw text from the response
        const rawText = responseData.candidates[0].content.parts[0].text;
        console.log('Raw Text Before Parsing:', rawText);

        // Clean the text: Remove ```json and ``` markers if present
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace('```json', '').replace(/```$/g, '').trim();
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```/, '').replace(/```$/g, '').trim();
        }
        
        // Handle cases where JSON might be nested in other text
        const jsonMatch = cleanedText.match(/({[\s\S]*})/);
        if (jsonMatch) {
          cleanedText = jsonMatch[1];
        }

        // Parse the cleaned text as JSON
        aiData = JSON.parse(cleanedText);
        console.log('Parsed AI Data:', aiData);
      } catch (parseErr) {
        console.error('Parsing Error:', parseErr);
        throw new Error('Failed to parse AI response as JSON. Raw response: ' + 
          responseData.candidates[0].content.parts[0].text.substring(0, 100) + '...');
      }

      // Handle case where aiData is an array
      const jobData = Array.isArray(aiData) ? aiData[0] : aiData;

      let driveDateFormatted = '';
      if (jobData.driveDate) {
        try {
          const parts = jobData.driveDate.split('/');
          if (parts.length === 3) {
            const [month, day, year] = parts.map(Number);
            const date = new Date(year, month - 1, day);
            driveDateFormatted = isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
          }
        } catch (err) {
          console.error('Error parsing drive date:', err);
        }
      }

      let expirationFormatted = '';
      if (jobData.expiration) {
        try {
          // Handle various date formats that might come from the AI
          const dateParts = jobData.expiration.split(/\s+/);
          if (dateParts.length >= 3) {
            const [datePart, timePart, period] = dateParts;
            const [month, day, year] = datePart.split('/').map(Number);
            
            // Handle time with or without period (AM/PM)
            let hours = 0, minutes = 0;
            if (timePart) {
              const [h, m] = timePart.split(':').map(Number);
              hours = h;
              minutes = m || 0;
              
              // Adjust for AM/PM if present
              if (period) {
                if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
                if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
              }
            }
            
            const date = new Date(year, month - 1, day, hours, minutes);
            if (!isNaN(date.getTime())) {
              expirationFormatted = formatDateForInput(date);
            }
          }
        } catch (err) {
          console.error('Error parsing expiration date:', err);
        }
      }

      const department = Array.isArray(jobData.department) ? jobData.department : 
                        (typeof jobData.department === 'string' ? [jobData.department] : []);

      const updatedFormData = {
        companyName: jobData.companyName || 'Unknown Company',
        jobDescription: jobData.jobDescription || description,
        driveDate: driveDateFormatted || '',
        expiration: expirationFormatted || '',
        batch: jobData.batch || '',
        department: department.length > 0 ? department : [],
        driveLink: jobData.driveLink || '',
      };

      console.log('Updated Form Data:', updatedFormData);
      setFormData(updatedFormData);
      setError(null);
    } catch (err) {
      console.error('Analysis Error Details:', err.response?.data || err.message);
      const errorMsg = `Failed to analyze job description: ${err.message}`;
      setError(errorMsg);
      
      // Don't reset the form completely on error, just mark that there was an error
      setFormData(prev => ({
        ...prev,
        companyName: prev.companyName || 'Error Parsing',
        jobDescription: description,
      }));
      
      setRetryCount(retryCount + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (rawDescription.trim()) analyzeJobDescription(rawDescription);
  };

  const handleManualRetry = () => {
    if (rawDescription.trim()) analyzeJobDescription(rawDescription);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...formData,
        driveDate: formatDateForBackend(formData.driveDate),
        expiration: formatDateForBackend(formData.expiration, true),
      };
      await axios.post(`${BASE_URL}/superadmin/createjobs`, [formattedData], { withCredentials: true });
      setFormData({ companyName: '', jobDescription: '', driveDate: '', expiration: '', batch: '', department: [], driveLink: '' });
      setRawDescription('');
      setError(null);
      alert('Job created successfully!');
    } catch (err) {
      setError(`Failed to create job: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Job Posting</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <div className="mt-2">
                <button 
                  onClick={handleManualRetry}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Retry Analysis
                </button>
                <span className="ml-2 text-xs text-gray-500">
                  (Attempt {retryCount + 1}/{MAX_RETRIES})
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description for AI Analysis</label>
          <textarea
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Paste the full job description here..."
            rows={4}
          />
          <button
            onClick={handleAutoFill}
            disabled={loading || !rawDescription.trim()}
            className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analyzing...' : 'Auto Fill'}
          </button>
          <div className="mt-1 text-xs text-gray-500">
            Note: If analysis fails, try shortening the job description or manually fill in the form.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., TechCorp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive Date</label>
              <input
                type="date"
                name="driveDate"
                value={formData.driveDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., 2025"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                rows={3}
                placeholder="e.g., Software Engineer role..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
              <input
                type="datetime-local"
                name="expiration"
                value={formData.expiration}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departments (comma-separated)</label>
              <input
                type="text"
                name="department"
                value={formData.department.join(', ')}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., Computer Science, IT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link</label>
              <input
                type="text"
                name="driveLink"
                value={formData.driveLink}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., https://example.com/drive"
              />
            </div>
          </div>

          <div className="col-span-full flex justify-start">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminJobPost;