import React, { useState, useEffect } from "react";
import axios from "axios";

const JobManagementView = ({ onJobCreated, onJobRemoved }) => {
  const [newJob, setNewJob] = useState({
    batch: "",
    jobDescription: "",
    department: "",
    expiration: "",
    companyName: "",
    driveDate: "",
  });
  const [jobList, setJobList] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:9999/superadmin/jobs", {
          withCredentials: true,
        });
        console.log("Raw response from /superadmin/jobs:", response.data); // Debug raw response
        if (response.data.success) {
          setJobList(response.data.jobs || []);
        } else {
          throw new Error(response.data.error || "Failed to fetch jobs");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.details || error.message || "Failed to load job data");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const departmentArray = newJob.department
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);

    const jobData = {
      ...newJob,
      department: departmentArray.length > 0 ? departmentArray : undefined,
    };

    try {
      const response = await axios.post(
        "http://localhost:9999/superadmin/createjobs",
        [jobData],
        { withCredentials: true }
      );
      console.log("Single job creation response:", response.data);
      setSuccess("Job created successfully!");
      setNewJob({
        batch: "",
        jobDescription: "",
        department: "",
        expiration: "",
        companyName: "",
        driveDate: "",
      });
      setJobList((prev) => [...prev, ...response.data]);
      if (onJobCreated) onJobCreated();
    } catch (error) {
      console.error("Error creating job:", error);
      setError(error.response?.data?.error || "Failed to create job");
    }
  };

  const handleRemoveJob = async (jobId) => {
    if (!jobId) {
      setError("Cannot remove job: Job ID is missing");
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(
        `http://localhost:9999/superadmin/job/${jobId}`,
        { withCredentials: true }
      );
      console.log("Job removal response:", response.status);
      setSuccess("Job removed successfully!");
      setJobList((prev) => prev.filter((job) => job.id !== jobId));
      if (onJobRemoved) onJobRemoved();
    } catch (error) {
      console.error("Error removing job:", error);
      if (error.response?.status === 404) {
        setSuccess("Job already removed or not found");
        setJobList((prev) => prev.filter((job) => job.id !== jobId));
        if (onJobRemoved) onJobRemoved();
      } else {
        setError(error.response?.data?.error || "Failed to remove job");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Job Management</h2>

      {/* Single Job Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create Job</h3>
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch (e.g., 2025)</label>
            <input
              type="text"
              name="batch"
              value={newJob.batch}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <input
              type="text"
              name="jobDescription"
              value={newJob.jobDescription}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Departments (comma-separated, e.g., Computer Science, IT)
            </label>
            <input
              type="text"
              name="department"
              value={newJob.department}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiration (MM/DD/YYYY HH:MM:SS, e.g., 12/31/2025 23:59:59)
            </label>
            <input
              type="text"
              name="expiration"
              value={newJob.expiration}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={newJob.companyName}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Drive Date (MM/DD/YYYY, e.g., 12/20/2025)
            </label>
            <input
              type="text"
              name="driveDate"
              value={newJob.driveDate}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
          >
            Create Job
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </form>
      </div>

      {/* Job List with Registered Students */}
      <h3 className="text-lg font-semibold mb-2">Current Jobs</h3>
      {jobList.length > 0 ? (
        <ul>
          {jobList.map((job) => {
            const registeredStudents = job.applications || [];
            return (
              <li key={job.id} className="mb-4 border-b pb-2">
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Company:</strong> {job.companyName} | <strong>Batch:</strong> {job.batch} |{" "}
                    <strong>Description:</strong> {job.jobDescription} |{" "}
                    <strong>Departments:</strong> {job.department?.join(", ") || "N/A"}
                  </span>
                  <button
                    onClick={() => handleRemoveJob(job.id)}
                    className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600"
                    disabled={!job.id}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2">
                  <strong>Registered Students:</strong>
                  {registeredStudents.length > 0 ? (
                    <ul className="ml-4 list-disc">
                      {registeredStudents.map((app) => (
                        <li key={app.studentId}>
                          <strong>Name:</strong> {app.student?.name || "N/A"} |{" "}
                          <strong>Email:</strong> {app.student?.email || "N/A"} |{" "}
                          <strong>Batch:</strong> {app.student?.batch || "N/A"} |{" "}
                          <strong>Reg No:</strong> {app.student?.regNo || "N/A"} |{" "}
                          <strong>Department:</strong> {app.student?.department || "N/A"} |{" "}
                          <strong>Roll No:</strong> {app.student?.rollNo || "N/A"} |{" "}
                          <strong>Placed:</strong> {app.student?.placedStatus || "N/A"} |{" "}
                          <strong>CGPA:</strong> {app.student?.cgpa || "N/A"} |{" "}
                          <strong>Applied At:</strong> {app.appliedAt || "N/A"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-4">No students registered for this job.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
};

export default JobManagementView;