import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999';
const GEMINI_API_KEY = 'AIzaSyAKjPqMsw7-5u26tkvnXEyAtIYyzrCxbQo';
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
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (includeTime) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00'; // Assuming seconds are not critical
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
    // Convert backend or AI-provided date to datetime-local format (YYYY-MM-DDTHH:MM)
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

  const analyzeJobDescription = async (description) => {
    if (!description) {
      setError(null);
      setFormData({ companyName: '', jobDescription: '', driveDate: '', expiration: '', batch: '', department: [], driveLink: '' });
      return;
    }
    try {
      setLoading(true);
      const prompt = `
        Extract the following fields from the job description below and return them in JSON format:
        - companyName (string)
        - jobDescription (string)
        - driveDate (string, MM/DD/YYYY)
        - expiration (string, MM/DD/YYYY hh:mm AM/PM)
        - batch (string)
        - department (array of strings)
        - driveLink (string, URL)
        Job Description: ${description}
      `;
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { response_mime_type: 'application/json' } },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const aiData = JSON.parse(response.data.candidates[0].content.parts[0].text);

      let expirationFormatted = '';
      if (aiData.expiration) {
        const [datePart, timePart] = aiData.expiration.split(' ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [time, period] = timePart.split(/(AM|PM)/);
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const date = new Date(year, month - 1, day, hours, minutes);
        expirationFormatted = formatDateForInput(date);
      }

      setFormData({
        companyName: aiData.companyName || '',
        jobDescription: aiData.jobDescription || '',
        driveDate: aiData.driveDate ? aiData.driveDate.split('/').reverse().join('-') : '',
        expiration: expirationFormatted,
        batch: aiData.batch || '',
        department: Array.isArray(aiData.department) ? aiData.department : [],
        driveLink: aiData.driveLink || '',
      });
      setError(null);
    } catch (err) {
      setError(`Failed to analyze job description: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
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