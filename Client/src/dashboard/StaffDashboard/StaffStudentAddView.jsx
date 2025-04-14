import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { fetchData, postData } from "../../services/apiService";
import { useForm } from "react-hook-form";

const StaffStudentAddView = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      batch: "",
    },
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);
  const [currentStaffDepartment, setCurrentStaffDepartment] = useState(null);
  const [activeTab, setActiveTab] = useState("single");
  const [isDragging, setIsDragging] = useState(false);

  const fetchStaffData = async () => {
    try {
      const response = await fetchData("/staff", { withCredentials: true });
      const { staffEmail, staffDepartment } = response.data;
      setCurrentStaffEmail(staffEmail);
      setCurrentStaffDepartment(staffDepartment);
    } catch (err) {
      setError("Failed to load staff data");
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const onManualSubmit = async (data) => {
    setMessage("");
    setError("");

    const studentData = [{
      email: data.email,
      password: data.password,
      batch: data.batch,
    }];

    try {
      setLoading(true);
      await postData("/staff/createstudents", studentData, {
        withCredentials: true,
      });
      toast.success("Students added successfully");
      reset();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add student");
      toast.error("Failed to add students");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
      setError("");
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
    if (
      droppedFile &&
      (droppedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel")
    ) {
      setFile(droppedFile);
      setError(null);
      setMessage("");
    } else {
      toast.info("Please upload only Excel files (.xlsx, .xls)");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file to upload");
      toast.error("Please select an Excel file to upload");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    const reader = new FileReader();

    reader.onload = async ({ target }) => {
      try {
        const workbook = XLSX.read(target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        const parsedData = rawData.map((student) => ({
          email: student.email?.trim() || "",
          password: student.password ? student.password.toString() : "",
          batch: student.batch != null ? student.batch.toString().trim() : "",
          staffEmail: student.staffEmail?.trim() || undefined,
          department: student.department?.trim() || undefined,
        }));

        const invalidRows = parsedData.filter(
          (student) =>
            !student.email ||
            !student.password ||
            student.email.trim() === "" ||
            student.password.trim() === ""
        );
        if (invalidRows.length > 0) {
          setError("Invalid data in Excel: Missing or empty email/password");
          toast.error("Invalid data in Excel: Missing or empty email/password");
          setLoading(false);
          return;
        }

        const response = await postData(
          "/staff/bulkuploadstudents",
          parsedData,
          { withCredentials: true }
        );

        if (response.data.success) {
          const inserted = response.data.inserted || [];
          if (inserted.length > 0) {
            toast.success("Successfully uploaded");
          } else {
            toast.info("No new students uploaded");
          }
        } else {
          setError(response.data.error || "Upload failed");
          toast.error("Upload error");
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.error || "Server error: Failed to upload students";
        const errorDetails =
          error.response?.data?.details ||
          error.response?.data?.error?.issues ||
          error.message;
        setError(
          `${errorMsg}${errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ""}`
        );
        toast.error("Upload error");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full px-6 sm:px-4 lg:px-6 py-0 mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Student</h2>

      <div className="flex flex-row sm:flex-row justify-center gap-2 sm:gap-4 mb-6">
        <button
          className={`w-full cursor-pointer sm:w-auto px-4 py-2 rounded-md text-sm ${
            activeTab === "single"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-orange-400 hover:text-white transition-colors`}
          onClick={() => setActiveTab("single")}
        >
          Single Student
        </button>
        <button
          className={`w-full cursor-pointer sm:w-auto px-4 py-2 rounded-md text-sm ${
            activeTab === "bulk"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-orange-400 hover:text-white transition-colors`}
          onClick={() => setActiveTab("bulk")}
        >
          Bulk Upload
        </button>
      </div>

      {activeTab === "single" && (
        <div className="w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
            Create Single Student
          </h3>
          <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter student name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <input
                type="text"
                {...register("batch", { required: "Batch is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 2023"
              />
              {errors.batch && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.batch.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              disabled={loading}
            >
              Add Student
            </button>
          </form>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Upload Multiple Students (Excel)
          </h3>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${
                isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300"
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
                      disabled={loading}
                    />
                  </label>
                  <p>or drag and drop</p>
                </div>
                <p className="text-sm text-gray-500">
                  Excel files only (.xlsx, .xls)
                </p>
                {file && (
                  <p className="text-base text-gray-600 mt-2 break-all">
                    Selected file: {file.name}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600"
              disabled={loading || !file}
            >
              Upload Students
            </button>
          </form>
        </div>
      )}

      {loading && (
        <p className="text-blue-500 text-center mt-4 text-base">Processing...</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default StaffStudentAddView;