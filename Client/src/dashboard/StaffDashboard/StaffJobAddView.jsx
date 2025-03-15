import React, { useState } from "react";
import axios from "axios";

const StaffJobAddView = () => {
  const [jobForm, setJobForm] = useState({
    batch: "",
    jobDescription: "",
    department: [],
    driveLink: "",
    expiration: "",
    companyName: "",
    driveDate: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:9999";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setJobForm((prev) => ({
        ...prev,
        [name]: value.split(",").map((dept) => dept.trim()),
      }));
    } else {
      setJobForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatDateForBackend = (dateStr, includeTime = false) => {
    try {
      const parts = dateStr.split(" ");
      const dateParts = parts[0].split("/");
      if (dateParts.length !== 3) throw new Error("Invalid date format");
      const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;
      if (includeTime && parts[1]) {
        const timeParts = parts[1].split(":");
        if (timeParts.length !== 3) throw new Error("Invalid time format");
        return `${formattedDate} ${parts[1]}`;
      }
      return formattedDate;
    } catch (err) {
      console.error("Date formatting error:", err.message);
      return dateStr;
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...jobForm,
        driveDate: formatDateForBackend(jobForm.driveDate),
        expiration: formatDateForBackend(jobForm.expiration, true),
      };
      console.log("Formatted data:", formattedData);
      const response = await axios.post(
        `${API_BASE_URL}/staff/createjobs`,
        [formattedData],
        { withCredentials: true }
      );
      console.log("Create Job Response:", response.data);
      setSuccess("Job created successfully!");
      setError(null);
      setJobForm({
        batch: "",
        jobDescription: "",
        department: [],
        driveLink: "",
        expiration: "",
        companyName: "",
        driveDate: "",
      });
    } catch (err) {
      console.error("Create Job Error:", err.response?.data);
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => `${e.path}: ${e.message}`).join(", ")
        : err.response?.data?.error || err.message;
      setError("Failed to create job: " + errorMsg);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Create Job Post</h1>
      <section>
        <h2>Add a New Job</h2>
        <form onSubmit={handleCreateJob} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Batch: </label>
            <input
              type="text"
              name="batch"
              value={jobForm.batch}
              onChange={handleInputChange}
              required
              placeholder="e.g., 2025"
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Job Description: </label>
            <input
              type="text"
              name="jobDescription"
              value={jobForm.jobDescription}
              onChange={handleInputChange}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Department (comma-separated): </label>
            <input
              type="text"
              name="department"
              value={jobForm.department.join(", ")}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science, IT"
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Drive Link: </label>
            <input
              type="url"
              name="driveLink"
              value={jobForm.driveLink}
              onChange={handleInputChange}
              required
              placeholder="e.g., https://example.com/drive"
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Expiration (MM/DD/YYYY HH:MM:SS): </label>
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
            <input
              type="text"
              name="companyName"
              value={jobForm.companyName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Drive Date (MM/DD/YYYY): </label>
            <input
              type="text"
              name="driveDate"
              value={jobForm.driveDate}
              onChange={handleInputChange}
              required
              placeholder="e.g., 12/31/2025"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Job"}
          </button>
        </form>
        {success && <p style={{ color: "green" }}>{success}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p style={{ color: "gray" }}>Loading...</p>}
      </section>
    </div>
  );
};

export default StaffJobAddView;