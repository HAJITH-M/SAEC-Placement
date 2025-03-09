import React, { useState, useEffect } from "react";
import axios from "axios";

const AddJobView = () => {
  const [jobForm, setJobForm] = useState({
    batch: "",
    jobDescription: "",
    department: "",
    driveLink: "",
    expiration: "",
    companyName: "",
    driveDate: "",
  });

  const [jobs, setJobs] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = "http://localhost:9999";

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/staff/createjobs`,
        [{
          ...jobForm,
          department: jobForm.department ? [jobForm.department] : [],
        }],
        { withCredentials: true }
      );
      setSuccess("Job created successfully!");
      setError(null);
      setJobForm({
        batch: "",
        jobDescription: "",
        department: "",
        driveLink: "",
        expiration: "",
        companyName: "",
        driveDate: "",
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create job");
      setSuccess(null);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/displaydrives`, {
        withCredentials: true,
      });
      setJobs(response.data.drives_list || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch jobs");
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      await axios.delete(`${API_BASE_URL}/staff/job/${jobId}`, {
        withCredentials: true,
      });
      setSuccess(`Job with ID ${jobId} removed successfully!`);
      setError(null);
      fetchJobs();
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setFilteredStudents([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove job");
      setSuccess(null);
    }
  };

  const fetchRegisteredStudents = async (driveId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/registeredstudents/${driveId}`, {
        withCredentials: true,
      });
      const students = response.data.registered_students || [];
      setFilteredStudents(students);
      setError(null);
    } catch (err) {
      console.error("Fetch registered students error:", err.response);
      setError(err.response?.status === 404 ? "No students registered for this job" : err.response?.data?.error || "Failed to fetch registered students");
      setFilteredStudents([]);
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    fetchRegisteredStudents(jobId);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Staff Job Management</h1>

      {/* Job Creation Form */}
      <section>
        <h2>Create a New Job Post</h2>
        <form onSubmit={handleCreateJob} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Batch: </label>
            <input type="text" name="batch" value={jobForm.batch} onChange={handleInputChange} required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Job Description: </label>
            <input type="text" name="jobDescription" value={jobForm.jobDescription} onChange={handleInputChange} required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Department: </label>
            <input type="text" name="department" value={jobForm.department} onChange={handleInputChange} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Drive Link: </label>
            <input type="url" name="driveLink" value={jobForm.driveLink} onChange={handleInputChange} required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Expiration (mm/dd/yyyy HH:mm:ss): </label>
            <input
              type="text"
              name="expiration"
              value={jobForm.expiration}
              onChange={handleInputChange}
              placeholder="e.g., 12/31/2025 23:59:59"
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Company Name: </label>
            <input type="text" name="companyName" value={jobForm.companyName} onChange={handleInputChange} required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Drive Date: </label>
            <input type="date" name="driveDate" value={jobForm.driveDate} onChange={handleInputChange} required />
          </div>
          <button type="submit">Create Job</button>
        </form>
        {success && <p style={{ color: "green" }}>{success}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </section>

      {/* Job List */}
      <section>
        <h2>Job Posts</h2>
        <button onClick={fetchJobs}>Refresh Job List</button>
        {jobs.length > 0 ? (
          <ul>
            {jobs.map((job) => (
              <li key={String(job.id)} style={{ marginBottom: "10px" }}>
                <strong>{job.companyName || "N/A"}</strong> - {job.jobDescription || "No description"} (ID: {String(job.id)})
                <button
                  onClick={() => handleRemoveJob(String(job.id))}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Remove
                </button>
                <button
                  onClick={() => handleJobSelect(String(job.id))}
                  style={{ marginLeft: "10px", color: "blue" }}
                >
                  View Registered Students
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs available.</p>
        )}
      </section>

      {/* Registered Students for Selected Job */}
      <section>
        <h2>Registered Students {selectedJobId ? `for Job ID: ${selectedJobId}` : ""}</h2>
        {filteredStudents.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Application ID</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Student Name</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Arrears</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>CGPA</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Batch</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Department</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Placed Status</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Reg No</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Roll No</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Company Name</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Applied At</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={String(student.applicationId)}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(student.applicationId) || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.studentName || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.email || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.arrears ?? "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.cgpa ?? "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.batch || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.department || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.placedStatus || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.regNo || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.rollNo || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{student.companyName || "N/A"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{new Date(student.appliedAt).toLocaleString() || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedJobId ? (
          <p>No students registered for this job.</p>
        ) : (
          <p>Select a job to view registered students.</p>
        )}
      </section>
    </div>
  );
};

export default AddJobView;