// JobManagementView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999';

const JobManagementView = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    driveDate: '',
    expiration: '',
    batch: '',
    department: [],
    driveLink: '',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/superadmin/jobs-with-students`, {
        withCredentials: true,
      });
      console.log('API Response:', response.data);
      setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      setError('Failed to fetch jobs: ' + (err.response?.data?.error || err.message));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData({ ...formData, [name]: value.split(',').map(d => d.trim()) });
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
        {
          withCredentials: true,
        }
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
      fetchJobs();
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

  const handleDelete = async (jobId) => {
    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/superadmin/job/${jobId}`, {
        withCredentials: true,
      });
      fetchJobs();
    } catch (err) {
      setError('Failed to delete job: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Job Creation Form */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
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

      {/* Jobs List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Job Listings</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && <div className="text-gray-500 mb-4">Loading...</div>}
        {!loading && jobs.length === 0 && (
          <div className="text-gray-500 mb-4">No jobs available</div>
        )}
        <div className="space-y-4">
          {jobs && jobs.map((job) => (
            <div key={job.jobId} className="border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{job.companyName}</h3>
                  <p className="text-gray-600">{job.jobDescription}</p>
                  <p className="text-sm text-gray-500">Drive Date: {job.driveDate}</p>
                  <p className="text-sm text-gray-500">Batch: {job.batch}</p>
                  <p className="text-sm text-gray-500">
                    Departments: {job.department?.join(', ') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drive Link: <a href={job.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {job.driveLink || 'N/A'}
                    </a>
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Students
                  </button>
                  <button
                    onClick={() => handleDelete(job.jobId)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Registered Students Modal */}
              {selectedJob && selectedJob.jobId === job.jobId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">
                      Registered Students for {selectedJob.companyName}
                    </h3>
                    {selectedJob.students && selectedJob.students.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">CGPA</th>
                            <th className="p-2 text-left">Applied At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJob.students.map((student) => (
                            <tr key={student.applicationId} className="border-t">
                              <td className="p-2">{student.studentName || 'N/A'}</td>
                              <td className="p-2">{student.email || 'N/A'}</td>
                              <td className="p-2">{student.cgpa || 'N/A'}</td>
                              <td className="p-2">{student.appliedAt || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No students registered for this job yet.</p>
                    )}
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobManagementView;