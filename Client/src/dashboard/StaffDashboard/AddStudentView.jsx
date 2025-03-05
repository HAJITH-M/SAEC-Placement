import React, { useState, useEffect } from "react";
import axios from "axios";

const AddStudentView = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentToRemove, setStudentToRemove] = useState(null); // For confirmation popup

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { students: studentList } = response.data;
        setStudents(studentList || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const studentData = [{ email, password }];

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
      // Update student list
      setStudents((prev) => [...prev, ...response.data]);
    } catch (err) {
      console.error("Error adding student:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || "Failed to add student");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`http://localhost:9999/staff/student/${studentId}`, {
        withCredentials: true,
      });
      console.log(`Student ${studentId} removed`);
      setStudents((prev) => prev.filter((student) => student.studentId !== studentId));
      setStudentToRemove(null); // Close popup
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
      <form onSubmit={handleSubmit}>
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
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Add Student
        </button>
      </form>

      {/* Student List */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Students</h3>
        {students.length === 0 ? (
          <p className="text-gray-600">No students added yet.</p>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <li
                key={student.studentId}
                className="flex justify-between items-center p-2 border-b border-gray-200"
              >
                <span>{student.email}</span>
                <button
                  onClick={() => confirmRemove(student)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
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