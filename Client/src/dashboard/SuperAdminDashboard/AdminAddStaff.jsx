import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postData } from "../../services/apiService";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

const AdminAddStaff = ({ onStaffCreated }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
      department: ""
    }
  });

  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
    } else {
      toast.error("Please upload only Excel files (.xlsx, .xls)");
    }
  };

  const handleCreateStaff = async (data) => {
    try {
      const response = await postData(
        "/superadmin/createstaffs",
        [{ ...data }],
        { withCredentials: true }
      );
      toast.success("Staff created successfully!");
      reset();
      onStaffCreated();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to create staff");
      }
    }
  };

  const handleUploadStaff = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

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
          toast.error("Excel file must contain Email and Password columns with valid data");
          return;
        }

        try {
          const response = await postData(
            "/superadmin/createstaffs",
            staffArray,
            { withCredentials: true }
          );
          const insertedCount = response.data.inserted.length;
          const skippedMessage = response.data.skipped;
          toast.success(
            insertedCount > 0
              ? `Successfully created ${insertedCount} staff member(s)${skippedMessage ? `. ${skippedMessage}` : ""}`
              : skippedMessage || "No new staff added"
          );
          setFile(null);
          e.target.reset();
          onStaffCreated();
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to upload staff");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Failed to process Excel file");
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-0">
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

      {activeTab === 'single' && (
        <div className="w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Create Single Staff</h3>
          <form onSubmit={handleSubmit(handleCreateStaff)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address"
                  }
                })}
                type="email"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                {...register("department")}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Computer Science"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 cursor-pointer text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Create Staff
            </button>
          </form>
        </div>
      )}

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
              className="w-full bg-orange-500 cursor-pointer text-white py-3 px-6 rounded-md hover:bg-orange-600"
            >
              Upload Staff
            </button>
          </form>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminAddStaff;