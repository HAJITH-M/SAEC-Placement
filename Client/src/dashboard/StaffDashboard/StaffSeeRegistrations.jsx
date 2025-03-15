import React, { useState, useEffect } from "react";
import axios from "axios";

const StaffSeeRegistrations = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState({});
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:9999";

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/staff/displaydrives`, {
        withCredentials: true,
      });
      const drives = response.data.drives_list || [];
      const jobsWithCounts = await Promise.all(
        drives.map(async (job) => {
          const studentsResponse = await axios.get(
            `${API_BASE_URL}/staff/registeredstudents/${job.id}`,
            { withCredentials: true }
          );
          const students = studentsResponse.data.registered_students || [];
          const byDepartment = students.reduce((acc, student) => {
            const dept = student.department || "Unknown";
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {});
          const byBatch = students.reduce((acc, student) => {
            const batch = student.batch || "Unknown";
            acc[batch] = (acc[batch] || 0) + 1;
            return acc;
          }, {});
          return { ...job, studentCount: students.length, byDepartment, byBatch, students };
        })
      );
      setJobs(jobsWithCounts);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/staff/job/${jobId}`, {
        withCredentials: true,
      });
      setSuccess(`Job with ID ${jobId} removed successfully!`);
      setError(null);
      fetchJobs();
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setFilteredStudents({});
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove job");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredStudents = async (driveId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/staff/registeredstudents/${driveId}`, {
        withCredentials: true,
      });
      const students = response.data.registered_students || [];
      const byDepartment = students.reduce((acc, student) => {
        const dept = student.department || "Unknown";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});
      const byBatch = students.reduce((acc, student) => {
        const batch = student.batch || "Unknown";
        acc[batch] = (acc[batch] || 0) + 1;
        return acc;
      }, {});
      setFilteredStudents({ students, byDepartment, byBatch });
      setError(null);
    } catch (err) {
      console.error("Fetch registered students error:", err.response);
      setError(
        err.response?.status === 404
          ? "No students registered for this job"
          : err.response?.data?.error || "Failed to fetch registered students"
      );
      setFilteredStudents({});
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    fetchRegisteredStudents(jobId);
  };

  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
    // No need to fetch again; use the students already in job.students
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Job Posts and Registrations</h1>

      {/* Job Posts */}
      <section>
        <h2>Job Posts</h2>
        <button onClick={fetchJobs} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Job List"}
        </button>
        {jobs.length > 0 ? (
          <ul>
            {jobs.map((job) => (
              <li key={String(job.id)} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <strong>{job.companyName || "N/A"}</strong> - {job.jobDescription || "No description"} (ID: {String(job.id)})
                  <span style={{ marginLeft: "10px" }}>
                    Registered Students: {job.studentCount || 0}
                  </span>
                  <button
                    onClick={() => toggleJobDetails(String(job.id))}
                    style={{ marginLeft: "10px", color: expandedJobId === String(job.id) ? "gray" : "blue" }}
                    disabled={loading}
                  >
                    {expandedJobId === String(job.id) ? "Hide Details" : "Show Details"}
                  </button>
                  <button
                    onClick={() => handleRemoveJob(String(job.id))}
                    style={{ marginLeft: "10px", color: "red" }}
                    disabled={loading}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleJobSelect(String(job.id))}
                    style={{ marginLeft: "10px", color: "blue" }}
                    disabled={loading}
                  >
                    Select for Full List
                  </button>
                </div>
                {expandedJobId === String(job.id) && (
                  <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <p>By Department:</p>
                    <ul>
                      {Object.entries(job.byDepartment || {}).map(([dept, count]) => (
                        <li key={dept}>{dept}: {count}</li>
                      ))}
                    </ul>
                    <p>By Batch:</p>
                    <ul>
                      {Object.entries(job.byBatch || {}).map(([batch, count]) => (
                        <li key={batch}>{batch}: {count}</li>
                      ))}
                    </ul>
                    <p>Registered Students:</p>
                    {job.students && job.students.length > 0 ? (
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
                          {job.students.map((student) => (
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
                    ) : (
                      <p>No students registered for this job.</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs available.</p>
        )}
        {success && <p style={{ color: "green" }}>{success}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p style={{ color: "gray" }}>Loading...</p>}
      </section>

      {/* Registered Students Full List */}
      <section>
        <h2>Registered Students {selectedJobId ? `for Job ID: ${selectedJobId}` : ""}</h2>
        {filteredStudents.students && filteredStudents.students.length > 0 ? (
          <div>
            <p>By Department:</p>
            <ul>
              {Object.entries(filteredStudents.byDepartment || {}).map(([dept, count]) => (
                <li key={dept}>{dept}: {count}</li>
              ))}
            </ul>
            <p>By Batch:</p>
            <ul>
              {Object.entries(filteredStudents.byBatch || {}).map(([batch, count]) => (
                <li key={batch}>{batch}: {count}</li>
              ))}
            </ul>
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
                {filteredStudents.students.map((student) => (
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
          </div>
        ) : selectedJobId ? (
          <p>No students registered for this job.</p>
        ) : (
          <p>Select a job to view registered students.</p>
        )}
      </section>
    </div>
  );
};

export default StaffSeeRegistrations;