import React, { useState } from "react";
import axios from "axios";

const AddStudentView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Prepare the student data as an array (backend expects an array)
    const studentData = [{ email, password }]; // staffId will be added by backend

    try {
      const response = await axios.post(
        "http://localhost:9999/staff/createstudents",
        studentData,
        { withCredentials: true }
      );
      console.log("Students added:", response.data);
      setMessage("Student added successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error adding student:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || "Failed to add student");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Student</h2>
      <form onSubmit={handleSubmit}>
        
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
    </div>
  );
};

export default AddStudentView;