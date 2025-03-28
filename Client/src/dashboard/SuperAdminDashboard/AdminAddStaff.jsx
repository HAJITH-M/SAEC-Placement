import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData } from "../../services/apiService";

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
      const response = await postData(
        "/superadmin/createstaffs",
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
          const response = await postData(
            "/superadmin/createstaffs",
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
    <div className="w-full px-2 sm:px-4 lg:px-6 py-0">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6">
        <button
          className={`w-full sm:w-auto cursor-pointer px-4 py-2 rounded-md text-sm ${activeTab === 'single' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-orange-400 hover:text-white transition-colors`}
          onClick={() => setActiveTab('single')}
        >
          Single Staff
        </button>
        <button
          className={`w-full sm:w-auto cursor-pointer px-4 py-2 rounded-md text-sm ${activeTab === 'bulk' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-orange-400 hover:text-white transition-colors`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Upload
        </button>
      </div>

      {/* Single Staff Form */}
      {activeTab === 'single' && (
        <div className="w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Create Single Staff</h3>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newStaff.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Computer Science"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Create Staff
            </button>
          </form>
        </div>
      )}

      {/* Bulk Upload Form */}
      {activeTab === 'bulk' && (
        <div className="w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">Upload Multiple Staff (Excel)</h3>
          <form onSubmit={handleUploadStaff} className="space-y-4">
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
                <div className="flex flex-col sm:flex-row justify-center items-center text-base text-gray-600 gap-2">
                  <label className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p>or drag and drop</p>
                </div>
                <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
                {file && (
                  <p className="text-base text-gray-600 mt-2 break-all">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600"
            >
              Upload Staff
            </button>
          </form>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && <p className="text-red-500 text-center mt-4 text-base">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4 text-base">{success}</p>}
    </div>
  );
};

export default AdminAddStaff;