import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999';
const GEMINI_API_KEY = 'AIzaSyAKjPqMsw7-5u26tkvnXEyAtIYyzrCxbQo'; // Replace with your real key from Google AI Studio
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
      const parts = dateStr.split(' ');
      const dateParts = parts[0].split('/');
      if (dateParts.length !== 3) throw new Error('Invalid date format');
      const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      if (includeTime && parts[1]) {
        const timeParts = parts[1].split(':');
        if (timeParts.length !== 3) throw new Error('Invalid time format');
        return `${formattedDate} ${parts[1]}`;
      }
      return formattedDate;
    } catch (err) {
      console.error('Date formatting error:', err.message);
      return dateStr;
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

      const prompt = `
        Extract the following fields from the job description below and return them in JSON format. Ensure each field is identified accurately and separately:
        - companyName (string, the name of the company)
        - jobDescription (string, the job role or summary, excluding other details)
        - driveDate (string, format MM/DD/YYYY, the date of the job drive)
        - expiration (string, format MM/DD/YYYY HH:MM:SS, the application deadline)
        - batch (string, e.g., "2025", the batch year)
        - department (array of strings, list of departments like "Computer Science")
        - driveLink (string, URL, the link to the drive or application)

        If a field is not present, return an empty string or empty array as appropriate. Do not combine fields unless specified.

        Job Description:
        ${description}
      `;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json' },
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const aiDataText = response.data.candidates[0].content.parts[0].text;
      console.log('Raw Gemini Response:', aiDataText);
      
      let parsedData;
      
      try {
        parsedData = JSON.parse(aiDataText);
      } catch (parseError) {
        try {
          const cleanedText = aiDataText.replace(/|/g, '').trim();
          parsedData = JSON.parse(cleanedText);
        } catch (parseError2) {
          const jsonMatch = aiDataText.match(/(\{.*\}|\[.*\])/s);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Could not parse JSON response');
          }
        }
      }
      
      console.log('Parsed data:', parsedData);
      
      let aiData;
      if (Array.isArray(parsedData)) {
        aiData = parsedData[0] || {};
      } else {
        aiData = parsedData;
      }
      
      console.log('Data to use for form:', aiData);
      
      setFormData({
        companyName: aiData.companyName || '',
        jobDescription: aiData.jobDescription || '',
        driveDate: aiData.driveDate || '',
        expiration: aiData.expiration || '',
        batch: aiData.batch || '',
        department: Array.isArray(aiData.department) ? aiData.department : [],
        driveLink: aiData.driveLink || '',
      });
      
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error('Gemini API Error:', err.response?.data || err);
      setError(`Failed to analyze job description: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (rawDescription.trim()) {
      analyzeJobDescription(rawDescription);
    }
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
      console.log('Sending job data:', [formattedData]);
      const response = await axios.post(
        `${BASE_URL}/superadmin/createjobs`,
        [formattedData],
        { withCredentials: true }
      );
      console.log('Create Job Response:', response.data);
      setFormData({
        companyName: '',
        jobDescription: '',
        driveDate: '',
        expiration: '',
        batch: '',
        department: [],
        driveLink: '',
      });
      setRawDescription('');
      setError(null);
      alert('Job created successfully!');
    } catch (err) {
      console.error('Create Job Error:', err.response?.data);
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        : err.response?.data?.error || err.message;
      setError('Failed to create job: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Paste Job Description for AI Analysis</label>
          <textarea
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Paste the full job description here..."
            rows={5}
          />
          <button
            onClick={handleAutoFill}
            disabled={loading || !rawDescription.trim()}
            className="mt-2 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Auto Fill'}
          </button>
          {loading && <div className="mt-2 text-sm text-gray-500">Analyzing job description...</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Drive Date (MM/DD/YYYY)</label>
            <input
              type="text"
              name="driveDate"
              value={formData.driveDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              placeholder="e.g., 12/31/2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiration (MM/DD/YYYY HH:MM:SS)</label>
            <input
              type="text"
              name="expiration"
              value={formData.expiration}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              placeholder="e.g., 12/31/2025 23:59:59"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              placeholder="e.g., 2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Departments (comma-separated)</label>
            <input
              type="text"
              name="department"
              value={formData.department.join(', ')}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              placeholder="e.g., Computer Science, IT"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Drive Link</label>
            <input
              type="text"
              name="driveLink"
              value={formData.driveLink}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
              placeholder="e.g., https://example.com/drive"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminJobPost;