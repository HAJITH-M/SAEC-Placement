import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const StaffStudentAddView = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);
  const [currentStaffDepartment, setCurrentStaffDepartment] = useState(null);

  const fetchStaffData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/staff", { withCredentials: true });
      const { staffEmail, staffDepartment } = response.data;
      setCurrentStaffEmail(staffEmail);
      setCurrentStaffDepartment(staffDepartment);
    } catch (err) {
      console.error("Error fetching staff data:", err.response?.data || err.message);
      setError("Failed to load staff data");
    }
  };

  // Fetch staff data on mount if needed
  React.useEffect(() => {
    fetchStaffData();
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const studentData = [{ email, password, batch }];

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:9999/staff/createstudents",
        studentData,
        { withCredentials: true }
      );
      console.log("Students added:", response.data);
      setMessage("Student added successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setBatch("");
    } catch (err) {
      console.error("Error adding student:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage("");
    setError("");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file to upload");
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
        console.log("Raw Excel Data:", rawData);

        const parsedData = rawData.map((student) => ({
          email: student.email?.trim() || "",
          password: student.password ? student.password.toString() : "",
          batch: student.batch != null ? student.batch.toString().trim() : "",
          staffEmail: student.staffEmail?.trim() || undefined,
          department: student.department?.trim() || undefined,
        }));

        const invalidRows = parsedData.filter(
          (student) => !student.email || !student.password || student.email.trim() === "" || student.password.trim() === ""
        );
        if (invalidRows.length > 0) {
          setError("Invalid data in Excel: Missing or empty email/password");
          setLoading(false);
          return;
        }

        console.log("Formatted Data:", parsedData);

        const response = await axios.post(
          "http://localhost:9999/staff/bulkuploadstudents",
          parsedData,
          { withCredentials: true }
        );
        console.log("Full Response:", response.data);

        if (response.data.success) {
          const inserted = response.data.inserted || [];
          if (inserted.length > 0) {
            const yourInserted = inserted.filter((student) => student.staffEmail === currentStaffEmail);
            setMessage(
              `Successfully uploaded ${inserted.length} students (${yourInserted.length} assigned to you)`
            );
          } else {
            setMessage(`No new students uploaded (${response.data.skipped.length} duplicates)`);
          }
        } else {
          setError(response.data.error || "Upload failed");
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Server error: Failed to upload students";
        const errorDetails = error.response?.data?.details || error.response?.data?.error?.issues || error.message;
        setError(`${errorMsg}${errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ""}`);
        console.error("Upload Error:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Student</h2>

      {/* Manual Entry Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Student Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Student Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="submit"
            className="w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600"
            disabled={loading}
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Bulk Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Bulk Upload (Excel)</h3>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading || !file}
          >
            Upload Excel File
          </button>
          {loading && <p className="text-blue-500 mt-2">Uploading...</p>}
          {message && <p className="text-green-500 mt-4">{message}</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default StaffStudentAddView;