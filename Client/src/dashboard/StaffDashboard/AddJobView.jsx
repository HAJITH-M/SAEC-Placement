import React, { useState, useEffect } from 'react';
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
    department: '',
  });
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchJobs = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get('http://localhost:9999/staff', {
        withCredentials: true,
      });
      console.log('Fetched staff data:', response.data);
      setJobs(response.data.drives || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized: Please log in');
        navigate('/staff/login');
      } else {
        setError('Failed to fetch jobs');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let departments = formData.department
        ? formData.department
            .split(',')
            .map((d) => d.trim())
            .filter((d) => d.length > 0)
        : [];

      if (departments.length === 0 && formData.department && formData.department.trim()) {
        departments.push(formData.department.trim());
      }

      const jobData = [{
        batch: formData.batch,
        expiration: new Date(formData.expiration).toISOString(),
        companyName: formData.companyName,
        driveDate: formData.driveDate,
        jobDescription: formData.jobDescription,
        department: departments,
      }];

      console.log('Sending job data:', JSON.stringify(jobData, null, 2));

      const response = await axios.post(
        'http://localhost:9999/staff/createjobs',
        jobData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
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
          department: '',
        });
        await fetchJobs();
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

  const handleRemoveJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    console.log('Attempting to remove job with ID:', jobId, 'Type:', typeof jobId);

    try {
      const response = await axios.delete(`http://localhost:9999/staff/job/${jobId}`, {
        withCredentials: true,
      });

      console.log('Delete response:', response.status, response.data);

      if (response.status === 204) {
        alert('Job removed successfully!');
        await fetchJobs();
      } else {
        throw new Error('Failed to remove job - unexpected status');
      }
    } catch (err) {
      console.error('Error removing job:', err);
      if (err.response) {
        console.error('Response error:', err.response.status, err.response.data);
        if (err.response.status === 401) {
          setError('Unauthorized: Please log in');
          navigate('/staff/login');
        } else if (err.response.status === 404) {
          setError('Job not found');
          await fetchJobs();
        } else if (err.response.status === 422) {
          const errorMsg = err.response.data?.errors?.[0]?.message || 'Invalid job ID format';
          setError(`Failed to remove job: ${errorMsg}`);
        } else {
          setError(err.response.data?.errors?.[0]?.message || 'Failed to remove job');
        }
      } else if (err.request) {
        setError('Network error: Could not reach the server');
      } else {
        setError('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Post New Job</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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

      <h2 className="text-2xl font-bold mb-4">Current Jobs</h2>
      {fetchLoading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Company Name</th>
                <th className="py-2 px-4 border-b">Batch</th>
                <th className="py-2 px-4 border-b">Drive Date</th>
                <th className="py-2 px-4 border-b">Expiration</th>
                <th className="py-2 px-4 border-b">Departments</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="py-2 px-4 border-b">{job.companyName}</td>
                  <td className="py-2 px-4 border-b">{job.batch}</td>
                  <td className="py-2 px-4 border-b">{job.driveDate}</td>
                  <td className="py-2 px-4 border-b">{new Date(job.expiration).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{Array.isArray(job.department) ? job.department.join(', ') : job.department}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleRemoveJob(job.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddJobView;