import React, { useState } from "react";
import axios from "axios";

const GEMINI_API_KEY = 'AIzaSyAKjPqMsw7-5u26tkvnXEyAtIYyzrCxbQo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_BASE_URL = "http://localhost:9999";

const StaffJobAddView = () => {
  const [jobForm, setJobForm] = useState({
    batch: "",
    jobDescription: "",
    department: [],
    driveLink: "",
    expiration: "",
    companyName: "",
    driveDate: "",
  });
  const [rawDescription, setRawDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setJobForm((prev) => ({
        ...prev,
        [name]: value.split(",").map((dept) => dept.trim()),
      }));
    } else {
      setJobForm((prev) => ({ ...prev, [name]: value }));
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

  const analyzeJobDescription = async (description) => {
    if (!description) {
      setError(null);
      setJobForm({
        batch: "",
        jobDescription: "",
        department: [],
        driveLink: "",
        expiration: "",
        companyName: "",
        driveDate: "",
      });
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

      setJobForm({
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

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...jobForm,
        driveDate: formatDateForBackend(jobForm.driveDate),
        expiration: formatDateForBackend(jobForm.expiration, true),
      };
      console.log("Formatted data:", formattedData);
      const response = await axios.post(
        `${API_BASE_URL}/staff/createjobs`,
        [formattedData],
        { withCredentials: true }
      );
      console.log("Create Job Response:", response.data);
      setSuccess("Job created successfully!");
      setError(null);
      setJobForm({
        batch: "",
        jobDescription: "",
        department: [],
        driveLink: "",
        expiration: "",
        companyName: "",
        driveDate: "",
      });
      setRawDescription('');
    } catch (err) {
      console.error("Create Job Error:", err.response?.data);
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => `${e.path}: ${e.message}`).join(", ")
        : err.response?.data?.error || err.message;
      setError("Failed to create job: " + errorMsg);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create Job Post</h1>
        <section>
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
          <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch: </label>
                <input
                  type="text"
                  name="batch"
                  value={jobForm.batch}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2025"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description: </label>
                <textarea
                  name="jobDescription"
                  value={jobForm.jobDescription}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department (comma-separated): </label>
                <input
                  type="text"
                  name="department"
                  value={jobForm.department.join(", ")}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science, IT"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link: </label>
                <input
                  type="url"
                  name="driveLink"
                  value={jobForm.driveLink}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., https://example.com/drive"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration: </label>
                <input
                  type="datetime-local"
                  name="expiration"
                  value={jobForm.expiration}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name: </label>
                <input
                  type="text"
                  name="companyName"
                  value={jobForm.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Date: </label>
                <input
                  type="date"
                  name="driveDate"
                  value={jobForm.driveDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>
          {success && <p className="mt-4 text-green-600">{success}</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
          {loading && <p className="mt-4 text-gray-600">Loading...</p>}
        </section>
      </div>
    </div>
  );
};

export default StaffJobAddView;