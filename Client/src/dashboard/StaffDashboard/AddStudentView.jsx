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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { allStudents: all, yourStudents: yours } = response.data;
        setAllStudents(all || {});
        setYourStudents(yours || {});
      } catch (err) {
        console.error("Error fetching students:", err.response?.data || err.message);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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
      const newBatch = response.data[0].batch || "Unknown";
      setAllStudents((prev) => ({
        ...prev,
        [newBatch]: [...(prev[newBatch] || []), ...response.data],
      }));
      setYourStudents((prev) => ({
        ...prev,
        [newBatch]: [...(prev[newBatch] || []), ...response.data],
      }));
    } catch (err) {
      console.error("Error adding student:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || "Failed to add student");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select an Excel file to upload");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const studentData = jsonData.map((row) => ({
          email: row.email || row.Email,
          password: row.password || row.Password,
          batch: row.batch || row.Batch,
        }));

        if (studentData.some((student) => !student.email || !student.password || !student.batch)) {
          throw new Error("All students must have an email, password, and batch");
        }

        const uniqueStudentsMap = new Map();
        studentData.forEach((student) => {
          if (!uniqueStudentsMap.has(student.email)) {
            uniqueStudentsMap.set(student.email, student);
          }
        });
        const uniqueStudents = Array.from(uniqueStudentsMap.values());

        const response = await axios.post(
          "http://localhost:9999/staff/bulkuploadstudents",
          uniqueStudents,
          { withCredentials: true }
        );
        console.log("Bulk students added:", response.data);

        const { inserted, skipped, message: serverMessage } = response.data;
        setMessage(serverMessage || `Successfully uploaded ${inserted.length} unique students!`);
        if (skipped.length > 0) {
          setError(`Skipped ${skipped.length} duplicates: ${skipped.map(s => s.email).join(", ")}`);
        }
        setFile(null);
        setAllStudents((prev) => {
          const updated = { ...prev };
          inserted.forEach((student) => {
            const batch = student.batch || "Unknown";
            updated[batch] = [...(updated[batch] || []), student];
          });
          return updated;
        });
        setYourStudents((prev) => {
          const updated = { ...prev };
          inserted.forEach((student) => {
            const batch = student.batch || "Unknown";
            updated[batch] = [...(updated[batch] || []), student];
          });
          return updated;
        });
      } catch (err) {
        console.error("Error uploading students:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.error || err.message || "Failed to upload students");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`http://localhost:9999/staff/student/${studentId}`, {
        withCredentials: true },
      );
      console.log(`Student ${studentId} removed`);
      setAllStudents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((batch) => {
          updated[batch] = updated[batch].filter((student) => student.studentId !== studentId);
          if (updated[batch].length === 0) delete updated[batch];
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
    } catch (err) {
      console.error("Error removing student:", err);
      setError("Failed to remove student");
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
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Bulk Upload Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Bulk Upload (Excel)</h3>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload Excel File
          </button>
        </form>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* All Students by Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">All Students by Batch (Department)</h3>
        {Object.keys(allStudents).length === 0 ? (
          <p className="text-gray-600">No students in your department yet.</p>
        ) : (
          Object.entries(allStudents).map(([batch, batchStudents]) => (
            <div key={batch} className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Batch {batch} [{batchStudents.length}]</h4>
              <ul className="space-y-2">
                {batchStudents.map((student) => (
                  <li
                    key={student.studentId}
                    className="flex justify-between items-center p-2 border-b border-gray-200"
                  >
                    <span>
                      {student.email} (Added by: {student.staffEmail || "Unknown"})
                    </span>
                    <button
                      onClick={() => confirmRemove(student)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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

      {/* Your Students by Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Your Students by Batch</h3>
        {Object.keys(yourStudents).length === 0 ? (
          <p className="text-gray-600">You haven’t added any students yet.</p>
        ) : (
          Object.entries(yourStudents).map(([batch, batchStudents]) => (
            <div key={batch} className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Batch {batch} [{batchStudents.length}]</h4>
              <ul className="space-y-2">
                {batchStudents.map((student) => (
                  <li
                    key={student.studentId}
                    className="flex justify-between items-center p-2 border-b border-gray-200"
                  >
                    <span>
                      {student.email} (Added by: {student.staffEmail || "Unknown"})
                    </span>
                    <button
                      onClick={() => confirmRemove(student)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(studentToRemove.studentId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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