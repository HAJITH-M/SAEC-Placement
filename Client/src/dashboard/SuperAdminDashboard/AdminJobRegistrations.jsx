import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:9999';

const AdminJobRegistrations = () => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
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

  const toggleStudentList = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  return (
    <div className="container mx-auto p-4">
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
                  <p className="text-sm text-gray-500">
                    Registered Students: {job.students ? job.students.length : 0}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => toggleStudentList(job.jobId)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {expandedJobId === job.jobId ? 'Hide Students' : 'View Students'}
                  </button>
                  <button
                    onClick={() => handleDelete(job.jobId)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expandable Students List */}
              {expandedJobId === job.jobId && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Registered Students</h4>
                  {job.students && job.students.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Batch</th>
                          <th className="p-2 text-left">Department</th>
                          <th className="p-2 text-left">CGPA</th>
                          <th className="p-2 text-left">Phone Number</th>
                          <th className="p-2 text-left">Arrears</th>
                          <th className="p-2 text-left">Applied At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.students.map((student) => (
                          <tr key={student.applicationId} className="border-t">
                            <td className="p-2">{student.studentName || 'N/A'}</td>
                            <td className="p-2">{student.email || 'N/A'}</td>
                            <td className="p-2">{student.batch || 'N/A'}</td>
                            <td className="p-2">{student.department || 'N/A'}</td>
                            <td className="p-2">{student.cgpa ?? 'N/A'}</td>
                            <td className="p-2">{student.phoneNumber ?? 'N/A'}</td>
                            <td className="p-2">{student.noOfArrears ?? 'N/A'}</td>
                            <td className="p-2">{student.appliedAt || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No students registered for this job yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminJobRegistrations;