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
      console.log("Response from server:", response.data);

      onConfirm(selectedEmails); // Pass selected emails back to parent

      setSelectedEmails([]);
      setSearchTerm("");
      toast.success("Students marked as placed successfully!");
    } catch (err) {
      console.error("Error posting to /staff/updateplacedstudentslist:", err);
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
              className="w-full focus:outline-none text-sm"
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
      console.log("Current Staff Email:", staffEmail);

      const response = await fetchData(`/staff/displaydrives`, {
        withCredentials: true,
      });
      console.log("Display Drives Response:", response.data);
      const drives = response.data.drives_list || [];
      const jobsWithStudents = await Promise.all(
        drives.map(async (job) => {
          const studentsResponse = await fetchData(
            `/staff/registeredstudents/${job.id}`,
            { withCredentials: true }
          );
          console.log(
            `Registered Students Response for job ${job.id}:`,
            studentsResponse.data
          );
          const students = studentsResponse.data.registered_students || [];
          return { ...job, students };
        })
      );
      setJobs(jobsWithStudents);
      setError(null);
    } catch (err) {
      console.error("Fetch Jobs Error:", err);
      setError(err.response?.data?.error || "Failed to fetch jobs");
      toast.error("Failed to fetch jobs");
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
      await deleteData(`/staff/job/${jobToDelete.jobId}`, {
        withCredentials: true,
      });
      fetchJobs(); // Refresh jobs after deletion
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

    // Update the jobs state locally instead of re-fetching
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

    // Close the modal and reset state
    setShowPlacedModal(false);
    setSelectedJobId(null);
  };

  const toggleStudentList = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
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
            className={`px-4 py-2 rounded ${
              viewMode === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setViewMode("your")}
            className={`px-4 py-2 rounded ${
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
                <p className="max-w-[700px] text-justify text-gray-600 mt-2">{job.jobDescription}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <button
                  onClick={() => toggleStudentList(job.id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-orange-500 text-white py-1.5 px-3 rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  <Users size={16} />
                  <span className="hidden lg:inline">
                    {expandedJobId === job.id ? "Hide Students" : "View Students"}
                  </span>
                </button>
                <button
                  onClick={() => handleAddPlacedClick(job.id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition-colors text-sm"
                >
                  <CheckCircle size={16} />
                  <span className="hidden lg:inline">Add Placed Students</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(job.id, job.companyName)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 transition-colors text-sm"
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
                          className="flex items-center justify-center gap-1.5 bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition-colors text-sm"
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
                            className="flex items-center justify-center gap-1.5 bg-blue-500 text-white py-1.5 px-3 rounded hover:bg-blue-600 transition-colors text-sm"
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
                      Showing {filterStudents(job.students).length} out of{" "}
                      {viewMode === "your"
                        ? job.students.filter(
                            (student) =>
                              student.staffEmail === currentStaffEmail
                          ).length
                        : job.students.length}{" "}
                      students
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
      <ToastContainer />
    </div>
  );
};

export default StaffSeeRegistrations;