import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Calendar, Link, CheckCircle2, Trash2, Users, Search, Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { fetchData } from '../../services/apiService';

const BASE_URL = 'http://localhost:9999';

// Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the job "<span className="font-medium">{jobTitle}</span>"? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminJobRegistrations = () => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('studentName');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobFilterBy, setJobFilterBy] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetchData(`/superadmin/jobs-with-students`, {
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

  const handleDeleteClick = (jobId, companyName) => {
    setJobToDelete({ jobId, companyName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/superadmin/job/${jobToDelete.jobId}`, {
        withCredentials: true,
      });
      fetchJobs();
    } catch (err) {
      setError('Failed to delete job: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const toggleStudentList = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const filterStudents = (students) => {
    if (!searchTerm || filterBy === 'all') return students;
    return students.filter(student => {
      const searchValue = String(student[filterBy]).toLowerCase();
      return searchValue.includes(searchTerm.toLowerCase());
    });
  };

  const filterJobs = (jobs) => {
    if (!jobSearchTerm) return jobs;
    return jobs.filter(job => {
      if (jobFilterBy === 'all') {
        return (
          job.companyName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
          job.jobDescription.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
          job.batch.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
          (job.department && job.department.join(', ').toLowerCase().includes(jobSearchTerm.toLowerCase()))
        );
      }
      if (jobFilterBy === 'department' && job.department) {
        return job.department.join(', ').toLowerCase().includes(jobSearchTerm.toLowerCase());
      }
      return String(job[jobFilterBy]).toLowerCase().includes(jobSearchTerm.toLowerCase());
    });
  };

  const exportToExcel = (students, companyName) => {
    const filteredStudents = filterStudents(students);
    const data = filteredStudents.map(student => ({
      Name: student.studentName || 'N/A',
      Email: student.email || 'N/A',
      Batch: student.batch || 'N/A',
      Department: student.department || 'N/A',
      CGPA: student.cgpa ?? 'N/A',
      'Phone Number': `'${student.phoneNumber ?? 'N/A'}`, // Add single quote prefix to force text
      'No. of Arrears': student.noOfArrears ?? 'N/A',
      'Applied At': student.appliedAt || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set column widths (optional, for better readability)
    worksheet['!cols'] = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 10 }, // Batch
      { wch: 15 }, // Department
      { wch: 10 }, // CGPA
      { wch: 15 }, // Phone Number
      { wch: 12 }, // No. of Arrears
      { wch: 20 }, // Applied At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Generate filename with company name and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${companyName}_Students_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="p-2 sm:p-4">
      {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="p-4 mb-4 bg-gray-100 text-gray-700 rounded">Loading...</div>}

      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={24} className="text-orange-500" />
          Search Jobs
        </h2>

        <div className="flex flex-row gap-2">
          <div className="flex items-center border rounded p-1.5 w-1/4">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={jobFilterBy}
              onChange={(e) => setJobFilterBy(e.target.value)}
              className="w-full focus:outline-none text-sm"
            >
              <option value="all">All Fields</option>
              <option value="companyName">Company Name</option>
              <option value="jobDescription">Job Description</option>
              <option value="batch">Batch</option>
              <option value="department">Department</option>
            </select>
          </div>

          <div className="flex items-center flex-1 border rounded p-1.5">
            <Search size={16} className="text-orange-500 mr-1.5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              className="w-full focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {filterJobs(jobs).map((job) => (
          <div key={job.jobId} className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <div className="w-full sm:w-auto mb-4 sm:mb-0 ">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">{job.companyName}</h3>

                <p className="text-gray-600 mt-2 line-clamp-4 max-w-[900px] overflow-hidden text-ellipsis">{job.jobDescription}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleStudentList(job.jobId)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-orange-500 text-white py-1.5 px-3 rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  <Users size={16} />
                  {expandedJobId === job.jobId ? 'Hide Students' : 'View Students'}
                </button>
                <button
                  onClick={() => handleDeleteClick(job.jobId, job.companyName)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Drive Date: {job.driveDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Batch: {job.batch}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Departments: {job.department?.join(', ') || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Link size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <a href={job.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                  {job.driveLink || 'N/A'}
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Users size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Registered Students: {job.students ? job.students.length : 0}</span>
              </div>
            </div>

            {expandedJobId === job.jobId && (
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Registered Students</h4>
                  {job.students && job.students.length > 0 && (
                    <button
                      onClick={() => exportToExcel(job.students, job.companyName)}
                      className="flex items-center gap-1.5 bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      <Download size={16} />
                      Export to Excel
                    </button>
                  )}
                </div>
                <div className="flex flex-row gap-2 mb-6">
                  <div className="flex items-center border rounded p-1.5 w-1/4">
                    <Filter size={16} className="text-orange-500 mr-1.5" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full focus:outline-none text-sm"
                    >
                      <option value="all">All</option>
                      <option value="studentName">Name</option>
                      <option value="email">Email</option>
                      <option value="batch">Batch</option>
                      <option value="department">Department</option>
                      <option value="cgpa">CGPA</option>
                    </select>
                  </div>
                  <div className="flex items-center flex-1 border rounded p-1.5">
                    <Search size={16} className="text-orange-500 mr-1.5" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full focus:outline-none text-sm"
                    />
                  </div>
                </div>
                {job.students && job.students.length > 0 ? (
                  <>
                    <p className="mb-4 text-gray-600 text-center">Showing {filterStudents(job.students).length} out of {job.students.length} students</p>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Batch</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Department</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">CGPA</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Phone</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Arrears</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Applied At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filterStudents(job.students).map((student) => (
                            <tr key={student.applicationId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.studentName || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.email || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.batch || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.department || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.cgpa ?? 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.phoneNumber ?? 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.noOfArrears ?? 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{student.appliedAt || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No students registered for this job yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        jobTitle={jobToDelete?.companyName}
      />
    </div>
  );
};

export default AdminJobRegistrations;