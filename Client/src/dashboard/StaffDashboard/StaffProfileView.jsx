import React, { useState } from "react";
import axios from "axios"; // Ensure axios is imported

const StaffProfileView = ({ staffDetails }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.patch(
        "http://localhost:9999/staff/updatepassword",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Staff Profile</h2>
      <div className="mb-6">
        <p className="text-gray-600">
          <strong>Email:</strong> {staffDetails.email || "Unknown"}
        </p>
        <p className="text-gray-600">
          <strong>Name:</strong> {staffDetails.name || "Not set"}
        </p>
        <p className="text-gray-600">
          <strong>Department:</strong> {staffDetails.department || "Not set"}
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Update Password</h3>
      <form onSubmit={handlePasswordUpdate}>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default StaffProfileView;