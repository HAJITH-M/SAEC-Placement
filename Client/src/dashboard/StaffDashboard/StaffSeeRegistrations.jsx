import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Calendar,
  Link,
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { deleteData, fetchData, postData } from "../../services/apiService";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the job "
          <span className="font-medium">{jobTitle}</span>"? This action cannot
          be undone.
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

const AddPlacedStudentsModal = ({
  isOpen,
  onClose,
  onConfirm,
  jobId,
  students,
  companyName,
  currentStaffEmail,
  viewMode,
}) => {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("studentName");

  if (!isOpen) return null;

  const handleEmailToggle = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSubmit = async () => {
    try {
      const data = {
        emails: selectedEmails,
        companyName: companyName,
      };

      const response = await postData(
        `/staff/updateplacedstudentslist`,
        data,
        { withCredentials: true }
      );

      onConfirm(selectedEmails);

      setSelectedEmails([]);
      setSearchTerm("");
      toast.success("Students marked as placed successfully!");
    } catch (err) {
      toast.error("Failed to add placed students. Please try again.");
    }
  };

  const filterStudents = (studentsList) => {
    let filtered = studentsList;
    if (viewMode === "your" && currentStaffEmail) {
      filtered = filtered.filter(
        (student) => student.staffEmail === currentStaffEmail
      );
    }
    if (!searchTerm || filterBy === "all") return filtered;
    return filtered.filter((student) => {
      const searchValue = String(student[filterBy] || "").toLowerCase();
      return searchValue.includes(searchTerm.toLowerCase());
    });
  };

  const filteredStudents = filterStudents(students);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">
          Add Placed Students for{" "}
          <span className="text-green-600">{companyName}</span>
        </h3>

        <div className="flex flex-row gap-2 mb-4">
          <div className="flex items-center border rounded p-1.5 w-1/3">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full cursor-pointer focus:outline-none text-sm"
            >
              <option value="all">All</option>
              <option value="studentName">Name</option>
              <option value="email">Email</option>
              <option value="department">Department</option>
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

        <div className="max-h-96 overflow-y-auto mb-4">
          {filteredStudents && filteredStudents.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.email}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(student.email)}
                          onChange={() => handleEmailToggle(student.email)}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.studentName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.department || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              {searchTerm
                ? "No students match your search."
                : "No students available to mark as placed."}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            disabled={selectedEmails.length === 0}
          >
            Add Selected ({selectedEmails.length})
          </button>
        </div>
      </div>
    </div>
  );
};

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 cursor-pointer hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Company</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {job.companyName}
            </p>
          </div>
          <div className="flex items-center text-gray-600">
            <Building2 size={18} className="mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">{job.jobDescription}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={18} className="mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">
              Drive Date: {job.driveDate || "N/A"}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Building2 size={18} className="mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">
              Departments: {job.department?.join(", ") || "N/A"}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Link size={18} className="mr-2 text-orange-500 flex-shrink-0" />
            <a
              href={job.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm sm:text-base truncate"
            >
              {job.driveLink || "N/A"}
            </a>
          </div>
          <div className="flex items-center text-gray-600">
            <Users size={18} className="mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm sm:text-base">
              Registered Students: {job.students ? job.students.length : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center mt-4">
      <nav className="flex items-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-l-md ${
            currentPage === 1 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          First
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 ${
            currentPage === 1 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Prev
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 ${
              currentPage === page 
                ? 'bg-orange-600 text-white' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 ${
            currentPage === totalPages 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Next
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-r-md ${
            currentPage === totalPages 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Last
        </button>
      </nav>
    </div>
  );
};

const StaffSeeRegistrations = () => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("studentName");
  const [jobSearchTerm, setJobSearchTerm] = useState("");
  const [jobFilterBy, setJobFilterBy] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [showPlacedModal, setShowPlacedModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [jobPaginationMap, setJobPaginationMap] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const staffResponse = await fetchData(`/staff`, {
        withCredentials: true,
      });
      const staffEmail = staffResponse.data.staffEmail;
      setCurrentStaffEmail(staffEmail);

      const response = await fetchData(`/staff/displaydrives`, {
        withCredentials: true,
      });
      const drives = response.data.drives_list || [];
      
      // Create a new map to store pagination info for each job
      const newPaginationMap = {};
      
      const jobsWithStudents = await Promise.all(
        drives.map(async (job) => {
          // Add pagination parameters to the API call
          const studentsResponse = await fetchData(
            `/staff/registeredstudents/${job.id}?page=${
              jobPaginationMap[job.id]?.page || currentPage
            }&limit=${pageSize}`,
            { withCredentials: true }
          );
          
         
          
          const students = studentsResponse.data.registered_students || [];
          
          // Store pagination info for this specific job
          if (studentsResponse.data.pagination) {
            newPaginationMap[job.id] = studentsResponse.data.pagination;
          }
          
          return { ...job, students };
        })
      );
      
      // Update the pagination map
      setJobPaginationMap(newPaginationMap);
      setJobs(jobsWithStudents);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch jobs");
      toast.error("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStudents = async (jobId) => {
    try {
      setLoading(true);
      const page = jobPaginationMap[jobId]?.page || currentPage;
      
      const studentsResponse = await fetchData(
        `/staff/registeredstudents/${jobId}?page=${page}&limit=${pageSize}`,
        { withCredentials: true }
      );
      
      const students = studentsResponse.data.registered_students || [];
      
      // Update pagination info for this job
      if (studentsResponse.data.pagination) {
        setJobPaginationMap(prev => ({
          ...prev,
          [jobId]: studentsResponse.data.pagination
        }));
      }
      
      // Update the jobs state with new students data
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, students } : job
        )
      );
      
    } catch (err) {
      toast.error("Failed to fetch students for this job");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (jobId, newPage) => {
    // Update the page for this specific job
    setJobPaginationMap(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        page: newPage
      }
    }));
    
    // Fetch students for this job with the new page
    fetchJobStudents(jobId);
  };

  const handleDeleteClick = (jobId, companyName) => {
    setJobToDelete({ jobId, companyName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setLoading(true);
      await deleteData(`/staff/job/${jobToDelete.jobId}`, {
        withCredentials: true,
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete job");
      toast.error("Failed to delete job");
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

  const handleAddPlacedClick = (jobId) => {
    setSelectedJobId(jobId);
    setShowPlacedModal(true);
  };

  const handleAddPlacedConfirm = (emails) => {
    if (!selectedJobId || !emails.length) return;

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === selectedJobId
          ? {
              ...job,
              students: job.students.map((student) =>
                emails.includes(student.email)
                  ? { ...student, placedStatus: "yes" }
                  : student
              ),
            }
          : job
      )
    );

    setShowPlacedModal(false);
    setSelectedJobId(null);
  };

  const toggleStudentList = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      // When expanding a job, make sure we have the latest student data with pagination
      fetchJobStudents(jobId);
    }
  };

  const handleReadMore = (job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  const filterStudents = (students) => {
    let filteredStudents = students;
    if (viewMode === "your" && currentStaffEmail) {
      filteredStudents = students.filter(
        (student) => student.staffEmail === currentStaffEmail
      );
    }
    if (!searchTerm || filterBy === "all") return filteredStudents;
    return filteredStudents.filter((student) => {
      const searchValue = String(student[filterBy] || "").toLowerCase();
      return searchValue.includes(searchTerm.toLowerCase());
    });
  };

  const filterJobs = (jobs) => {
    if (!jobSearchTerm) return jobs;
    return jobs.filter((job) => {
      if (jobFilterBy === "all") {
        return (
          job.companyName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
          job.jobDescription
            .toLowerCase()
            .includes(jobSearchTerm.toLowerCase()) ||
          job.batch.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
          (job.department &&
            job.department
              .join(", ")
              .toLowerCase()
              .includes(jobSearchTerm.toLowerCase()))
        );
      }
      if (jobFilterBy === "department" && job.department) {
        return job.department
          .join(", ")
          .toLowerCase()
          .includes(jobSearchTerm.toLowerCase());
      }
      return String(job[jobFilterBy])
        .toLowerCase()
        .includes(jobSearchTerm.toLowerCase());
    });
  };

  const exportToExcel = (students, companyName, mode = "all") => {
    let exportStudents = students;
    if (mode === "your" && currentStaffEmail) {
      exportStudents = students.filter(
        (student) => student.staffEmail === currentStaffEmail
      );
    }
    const filteredStudents = filterStudents(exportStudents);
    const data = filteredStudents.map((student) => ({
      Name: student.studentName || "N/A",
      Email: student.email || "N/A",
      Batch: student.batch || "N/A",
      Department: student.department || "N/A",
      CGPA: student.cgpa ?? "N/A",
      "Phone Number": `${student.phoneNumber ?? "N/A"}`,
      "No. of Arrears": student.noOfArrears ?? "N/A",
      "Applied At": student.appliedAt || "N/A",
      "Placement Status": student.placedStatus === "yes" ? "Placed" : "Not Placed",
      "Assigned Staff": student.staffEmail || "Unassigned",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName =
      mode === "your"
        ? `${companyName}_Your_Students_${timestamp}.xlsx`
        : `${companyName}_Students_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={24} className="text-orange-500" />
          Search Jobs
        </h2>
        <div className="flex flex-row gap-2 mb-4">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded cursor-pointer ${
              viewMode === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setViewMode("your")}
            className={`px-4 py-2 rounded cursor-pointer ${
              viewMode === "your" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            Your Students
          </button>
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex items-center border rounded p-1.5 w-1/4">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={jobFilterBy}
              onChange={(e) => setJobFilterBy(e.target.value)}
              className="w-full focus:outline-none text-sm cursor-pointer"
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

      {loading && (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin text-orange-600" size={48} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {filterJobs(jobs).map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <div className="w-full sm:w-auto mb-4 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
                  {job.companyName}
                </h3>
                <div className="mt-2 text-gray-600 max-w-[700px] text-justify line-clamp-2">
                  {job.jobDescription}
                </div>
                {job.jobDescription.length > 100 && (
                  <button
                    onClick={() => handleReadMore(job)}
                    className="text-orange-500 cursor-pointer hover:text-orange-600 text-sm mt-1"
                  >
                    Read More
                  </button>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <button
                  onClick={() => toggleStudentList(job.id)}
                  className="flex-1 sm:flex-none flex items-center cursor-pointer justify-center gap-1.5 bg-orange-500 text-white py-1.5 px-3 rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  <Users size={16} />
                  <span className="hidden lg:inline">
                    {expandedJobId === job.id ? "Hide Students" : "View Students"}
                  </span>
                </button>
                <button
                  onClick={() => handleAddPlacedClick(job.id)}
                  className="flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-1.5 bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition-colors text-sm"
                >
                  <CheckCircle size={16} />
                  <span className="hidden lg:inline">Add Placed Students</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(job.id, job.companyName)}
                  className="flex-1 sm:flex-none cursor-pointer flex items-center justify-center gap-1.5 bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    <span className="hidden lg:inline">Delete</span>
                  </button>
                </div>
              </div>
  
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar
                    size={18}
                    className="mr-2 flex-shrink-0 text-orange-500"
                  />
                  <span className="truncate">
                    Drive Date: {job.driveDate || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Building2
                    size={18}
                    className="mr-2 flex-shrink-0 text-orange-500"
                  />
                  <span className="truncate">
                    Departments: {job.department?.join(", ") || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Link
                    size={18}
                    className="mr-2 flex-shrink-0 text-orange-500"
                  />
                  <a
                    href={job.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {job.driveLink || "N/A"}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users
                    size={18}
                    className="mr-2 flex-shrink-0 text-orange-500"
                  />
                  <span className="truncate">
                    Registered Students: {job.students ? job.students.length : 0}
                  </span>
                </div>
              </div>
  
              {expandedJobId === job.id && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Registered Students</h4>
                    <div className="flex gap-2">
                      {job.students && job.students.length > 0 && (
                        <>
                          <button
                            onClick={() =>
                              exportToExcel(job.students, job.companyName, "all")
                            }
                            className="flex cursor-pointer items-center justify-center gap-1.5 bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition-colors text-sm"
                          >
                            <Download size={16} />
                            <span className="hidden lg:inline">Export All to Excel</span>
                          </button>
                          {viewMode === "your" && (
                            <button
                              onClick={() =>
                                exportToExcel(
                                  job.students,
                                  job.companyName,
                                  "your"
                                )
                              }
                              className="flex items-center cursor-pointer justify-center gap-1.5 bg-blue-500 text-white py-1.5 px-3 rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                              <Download size={16} />
                              <span className="hidden lg:inline">Export Your Students</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
                      <p className="mb-4 text-gray-600 text-center">
                        {jobPaginationMap[job.id] && (
                          <>
                            Showing {job.students.length} out of{" "}
                            {jobPaginationMap[job.id].total}{" "}
                            {viewMode === "your" ? "your" : "total"} students
                          </>
                        )}
                      </p>
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Name
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Email
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Batch
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Department
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                CGPA
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Phone
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Arrears
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Applied At
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Assigned Staff
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                                Placement Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filterStudents(job.students).map((student) => (
                              <tr
                                key={student.applicationId}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.studentName || "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.email || "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.batch || "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.department || "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.cgpa ?? "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.phoneNumber ?? "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.noOfArrears ?? "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.appliedAt || "N/A"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.staffEmail || "Unassigned"}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                                  {student.placedStatus === "yes" ? (
                                    <span className="text-green-600">Placed</span>
                                  ) : (
                                    <span className="text-red-600">
                                      Not Placed
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination controls */}
                      {jobPaginationMap[job.id] && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600">
                              Page {jobPaginationMap[job.id].page} of{" "}
                              {Math.ceil(jobPaginationMap[job.id].total / jobPaginationMap[job.id].limit)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Page Size:</span>
                              <select 
                                value={pageSize}
                                onChange={(e) => {
                                  const newSize = Number(e.target.value);
                                  setPageSize(newSize);
                                  
                                  // Reset to page 1 for this job and update pagination info
                                  setJobPaginationMap(prev => ({
                                    ...prev,
                                    [job.id]: {
                                      ...prev[job.id],
                                      page: 1,
                                      limit: newSize
                                    }
                                  }));
                                  
                                  // Fetch students with new page size
                                  fetchJobStudents(job.id);
                                }}
                                className="border rounded p-1 text-sm"
                              >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </div>
                          </div>
                          
                          <Pagination 
                            currentPage={jobPaginationMap[job.id].page} 
                            totalPages={Math.ceil(jobPaginationMap[job.id].total / jobPaginationMap[job.id].limit)} 
                            onPageChange={(newPage) => handlePageChange(job.id, newPage)}
                          />
                        </div>
                      )}
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
  
        <AddPlacedStudentsModal
          isOpen={showPlacedModal}
          onClose={() => setShowPlacedModal(false)}
          onConfirm={handleAddPlacedConfirm}
          jobId={selectedJobId}
          students={jobs.find((job) => job.id === selectedJobId)?.students || []}
          companyName={
            jobs.find((job) => job.id === selectedJobId)?.companyName ||
            "Unknown Company"
          }
          currentStaffEmail={currentStaffEmail}
          viewMode={viewMode}
        />
  
        <JobDetailsModal
          isOpen={showJobDetailsModal}
          onClose={() => setShowJobDetailsModal(false)}
          job={selectedJob}
        />
        <ToastContainer />
      </div>
    );
  };
  
  export default StaffSeeRegistrations;  