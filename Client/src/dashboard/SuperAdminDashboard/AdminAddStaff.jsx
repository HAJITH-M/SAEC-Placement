import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const AdminAddStaff = ({ onStaffCreated }) => {
  const [newStaff, setNewStaff] = useState({ email: "", password: "", department: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || droppedFile.type === "application/vnd.ms-excel")) {
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
    } else {
      setError("Please upload only Excel files (.xlsx, .xls)");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:9999/superadmin/createstaffs",
        [{ ...newStaff }],
        { withCredentials: true }
      );
      console.log("Single staff creation response:", response.data);
      setSuccess("Staff created successfully!");
      setNewStaff({ email: "", password: "", department: "" });
      onStaffCreated();
    } catch (error) {
      console.error("Error creating staff:", error);
      if (error.response?.status === 409) {
        setError(error.response.data.error);
      } else {
        setError(error.response?.data?.error || "Failed to create staff");
      }
    }
  };

  const handleUploadStaff = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const staffArray = jsonData.map((row) => ({
          email: row.Email,
          password: row.Password,
          department: row.Department || "",
        }));

        if (staffArray.length === 0 || !staffArray.every((s) => s.email && s.password)) {
          setError("Excel file must contain Email and Password columns with valid data");
          return;
        }

        try {
          const response = await axios.post(
            "http://localhost:9999/superadmin/createstaffs",
            staffArray,
            { withCredentials: true }
          );
          console.log("Bulk staff creation response:", response.data);
          const insertedCount = response.data.inserted.length;
          const skippedMessage = response.data.skipped;
          setSuccess(
            insertedCount > 0
              ? `Successfully created ${insertedCount} staff member(s)${skippedMessage ? `. ${skippedMessage}` : ""}`
              : skippedMessage || "No new staff added"
          );
          setFile(null);
          e.target.reset();
          onStaffCreated();
        } catch (error) {
          console.error("Error uploading staff:", error);
          setError(error.response?.data?.error || "Failed to upload staff");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Unexpected error during file read:", error);
      setError("Failed to process Excel file");
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <button
          className={`mr-4 px-4 py-2 rounded-md ${activeTab === 'single' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('single')}
        >
          Single Staff
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'bulk' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Upload
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="mb-6 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Create Single Staff</h3>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newStaff.email}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={newStaff.password}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={newStaff.department}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Computer Science"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2.5 px-4 rounded-md hover:bg-orange-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Create Staff
            </button>
          </form>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-center">Upload Multiple Staff (Excel)</h3>
          <form onSubmit={handleUploadStaff} className="space-y-4 max-w-md mx-auto">
            <div
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${
                isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-2 text-center">
                <svg
                  className="h-12 w-12 text-gray-400 mx-auto"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex justify-center text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                {file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 w-full"
            >
              Upload Staff
            </button>
          </form>
        </div>
      )}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">{success}</p>}
    </div>
  );};

export default AdminAddStaff;