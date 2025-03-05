import React, { useState } from "react";
import axios from "axios";

const AddJobView = () => {
  const [companyName, setCompanyName] = useState("");
  const [batch, setBatch] = useState("");
  const [expiration, setExpiration] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [department, setDepartment] = useState(""); // Comma-separated input
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Basic frontend validation
    if (!companyName || !batch || !expiration || !driveDate) {
      setError("Company Name, Batch, Expiration Date, and Drive Date are required");
      return;
    }

    // Convert dates and split departments
    const expirationTimestamp = expiration ? `${expiration}T00:00:00Z` : "";
    const driveDateFormatted = driveDate;
    const departmentArray = department ? department.split(",").map((d) => d.trim()) : undefined;

    // Prepare job data as an array
    const jobData = [{
      batch,
      expiration: expirationTimestamp,
      companyName,
      driveDate: driveDateFormatted,
      jobDescription: jobDescription || undefined,
      department: departmentArray, // Array of departments
    }];
    console.log("Submitting job data:", jobData);

    try {
      const response = await axios.post(
        "http://localhost:9999/staff/createjobs",
        jobData,
        { withCredentials: true }
      );
      console.log("Jobs added:", response.data);
      setMessage("Job opportunity added successfully!");
      setCompanyName("");
      setBatch("");
      setExpiration("");
      setDriveDate("");
      setJobDescription("");
      setDepartment("");
    } catch (err) {
      console.error("Full error response:", err.response?.data);
      const errorMsg = err.response?.data?.error?.issues
        ? err.response.data.error.issues.map((issue) => `${issue.path[0]}: ${issue.message}`).join(", ")
        : err.response?.data?.error || "Failed to add job";
      setError(errorMsg);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Job Opportunity</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          placeholder="Batch (e.g., 2023)"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="date"
          placeholder="Expiration Date"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="date"
          placeholder="Drive Date"
          value={driveDate}
          onChange={(e) => setDriveDate(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          required
        />
        <textarea
          placeholder="Job Description (optional)"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Departments (e.g., CSE, ECE) - comma-separated, optional"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
        />
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Add Job Opportunity
        </button>
      </form>
    </div>
  );
};

export default AddJobView;