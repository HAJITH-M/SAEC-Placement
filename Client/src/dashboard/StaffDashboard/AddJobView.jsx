import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddJobView = () => {
  const navigate = useNavigate();

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    batch: '',
    expiration: getCurrentDateTime(),
    companyName: '',
    driveDate: '',
    jobDescription: '',
    department: '' // Will be parsed into an array
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse department: split by commas, trim, and filter out empty values
      let departments = formData.department
        ? formData.department
            .split(',')              // Split by comma
            .map(d => d.trim())      // Remove leading/trailing spaces
            .filter(d => d.length > 0) // Remove empty entries
        : [];

      console.log('Raw department input:', formData.department);
      console.log('Parsed departments:', departments);

      // Make sure departments is definitely an array with values
      if (departments.length === 0 && formData.department && formData.department.trim()) {
        departments.push(formData.department.trim());
      }

      const jobData = [{
        batch: formData.batch,
        expiration: new Date(formData.expiration).toISOString(),
        companyName: formData.companyName,
        driveDate: formData.driveDate,
        jobDescription: formData.jobDescription,
        department: departments // Always an array with values if any were entered
      }];

      console.log('Sending job data:', JSON.stringify(jobData, null, 2));

      // Make a test to see exactly what's being sent
      const test = JSON.stringify(jobData);
      console.log('Stringified job data:', test);
      console.log('Re-parsed test:', JSON.parse(test));

      const response = await axios.post(
        'http://localhost:9999/staff/createjobs',
        jobData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Response received:', response.data);

      if (response.status === 200 && response.data.length > 0) {
        alert('Job posted successfully!');
        setFormData({
          batch: '',
          expiration: getCurrentDateTime(),
          companyName: '',
          driveDate: '',
          jobDescription: '',
          department: ''
        });
      } else {
        throw new Error('No jobs were created');
      }
    } catch (err) {
      console.error('Full error:', err);
      if (err.response) {
        console.error('Response error:', err.response.data, err.response.status);
        if (err.response.status === 401) {
          setError('Unauthorized: Please log in');
          navigate('/staff/login');
        } else if (err.response.status === 403) {
          setError('Forbidden: Insufficient permissions');
        } else {
          setError(err.response.data?.error || 'Failed to post job');
        }
      } else if (err.request) {
        setError('Network error: Could not reach the server');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Post New Job</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block mb-1">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="batch" className="block mb-1">Batch</label>
          <input
            type="text"
            id="batch"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="driveDate" className="block mb-1">Drive Date</label>
          <input
            type="date"
            id="driveDate"
            name="driveDate"
            value={formData.driveDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="expiration" className="block mb-1">Expiration Date & Time</label>
          <input
            type="datetime-local"
            id="expiration"
            name="expiration"
            value={formData.expiration}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="jobDescription" className="block mb-1">Job Description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="block mb-1">Department(s)</label>
          <textarea
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={2}
            placeholder="e.g., cse,it,eee or cse, it, eee"
          />
          <p className="text-sm text-gray-500 mt-1">Enter departments separated by commas (with or without spaces)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default AddJobView;