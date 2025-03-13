import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const AddStudentView = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [allStudents, setAllStudents] = useState({});
  const [yourStudents, setYourStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);
  const [currentStaffDepartment, setCurrentStaffDepartment] = useState(null); // Added for department

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Removed GET /staff/me since GET /staff now provides staffEmail and staffDepartment
        const studentsResponse = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { staffEmail, staffDepartment, allStudents: all, yourStudents: yours } = studentsResponse.data;
        setCurrentStaffEmail(staffEmail);
        setCurrentStaffDepartment(staffDepartment);
        console.log("Current Staff Email:", staffEmail);
        console.log("Current Staff Department:", staffDepartment);
        setAllStudents(all || {});
        setYourStudents(yours || {});
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const studentData = [{ email, password, batch }];

    try {
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
      const newStudent = response.data[0];
      const newBatch = newStudent.batch || "Unknown";
      const newDept = newStudent.department || currentStaffDepartment || "Unknown";
      setAllStudents((prev) => ({
        ...prev,
        [newDept]: {
          ...(prev[newDept] || {}),
          [newBatch]: [...(prev[newDept]?.[newBatch] || []), newStudent],
        },
      }));
      if (newStudent.staffEmail === currentStaffEmail) {
        setYourStudents((prev) => ({
          ...prev,
          [newBatch]: [...(prev[newBatch] || []), newStudent],
        }));
      }
    } catch (err) {
      console.error("Error adding student:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || "Failed to add student");
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
          department: student.department?.trim() || undefined, // Add department
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
            setAllStudents((prev) => {
              const updated = { ...prev };
              inserted.forEach((student) => {
                const dept = student.department || currentStaffDepartment || "Unknown";
                const batch = student.batch || "Unknown";
                if (!updated[dept]) updated[dept] = {};
                updated[dept][batch] = [...(updated[dept][batch] || []), student];
              });
              return updated;
            });

            const yourInserted = inserted.filter((student) => student.staffEmail === currentStaffEmail);
            if (yourInserted.length > 0) {
              setYourStudents((prev) => {
                const updated = { ...prev };
                yourInserted.forEach((student) => {
                  const batch = student.batch || "Unknown";
                  updated[batch] = [...(updated[batch] || []), student];
                });
                return updated;
              });
              setMessage(`Successfully uploaded ${inserted.length} students (${yourInserted.length} assigned to you)`);
            } else {
              setMessage(`Successfully uploaded ${inserted.length} students (none assigned to you)`);
            }
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

  const handleRemoveStudent = async (studentId) => {
    try {
      const response = await axios.delete(`http://localhost:9999/staff/student/${studentId}`, {
        withCredentials: true,
      });
      console.log(`Student ${studentId} removed successfully`);
      setAllStudents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dept) => {
          Object.keys(updated[dept]).forEach((batch) => {
            updated[dept][batch] = updated[dept][batch].filter((student) => student.studentId !== studentId);
            if (updated[dept][batch].length === 0) delete updated[dept][batch];
          });
          if (Object.keys(updated[dept]).length === 0) delete updated[dept];
        });
        return updated;
      });
      setYourStudents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((batch) => {
          updated[batch] = updated[batch].filter((student) => student.studentId !== studentId);
          if (updated[batch].length === 0) delete updated[batch];
        });
        return updated;
      });
      setStudentToRemove(null);
      setMessage("Student removed successfully");
    } catch (err) {
      console.error("Error removing student:", err.response?.data || err.message);
      const errorMsg = err.response?.status === 404 
        ? "Student not found in database" 
        : err.response?.data?.errors?.[0]?.message || "Failed to remove student";
      setError(errorMsg);
    }
  };

  const confirmRemove = (student) => {
    setStudentToRemove(student);
  };

  const cancelRemove = () => {
    setStudentToRemove(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

      {/* All Students by Department and Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">All Students by Department and Batch</h3>
        {Object.keys(allStudents).length === 0 ? (
          <p className="text-gray-600">No students in your department yet.</p>
        ) : (
          Object.entries(allStudents).map(([dept, batches]) => (
            <div key={dept} className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Department: {dept}
              </h4>
              {Object.entries(batches).map(([batch, batchStudents]) => (
                <div key={batch} className="mb-4 ml-4">
                  <h5 className="text-md font-medium text-gray-700">
                    Batch {batch} [{batchStudents.length}]
                  </h5>
                  <ul className="space-y-2">
                    {batchStudents.map((student) => (
                      <li
                        key={student.studentId}
                        className="flex justify-between items-center p-2 border-b border-gray-200"
                      >
                        <span>
                          {student.email} (Added by: {student.staffEmail || "Unknown"}, Dept: {student.department || "Unknown"})
                        </span>
                        <button
                          onClick={() => confirmRemove(student)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Your Students by Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Your Students by Batch</h3>
        {Object.keys(yourStudents).length === 0 ? (
          <p className="text-gray-600">You haven’t added any students yet.</p>
        ) : (
          Object.entries(yourStudents).map(([batch, batchStudents]) => (
            <div key={batch} className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Batch {batch} [{batchStudents.length}]
              </h4>
              <ul className="space-y-2">
                {batchStudents.map((student) => (
                  <li
                    key={student.studentId}
                    className="flex justify-between items-center p-2 border-b border-gray-200"
                  >
                    <span>
                      {student.email} (Added by: {student.staffEmail || "Unknown"}, Dept: {student.department || "Unknown"})
                    </span>
                    <button
                      onClick={() => confirmRemove(student)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Popup */}
      {studentToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Removal</h3>
            <p className="mb-4">
              Are you sure you want to remove <strong>{studentToRemove.email}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(studentToRemove.studentId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudentView;