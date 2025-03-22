import React, { useState } from "react";
import axios from "axios";
import { Lock, Mail, User, Building2, KeyRound, Save } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 border-b pb-4">Staff Profile</h2>
      
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Mail className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{staffDetails.email || "Unknown"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <User className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{staffDetails.name || "Not set"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Building2 className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{staffDetails.department || "Not set"}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Lock className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Update Password</h3>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm sm:text-base"
              required
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm sm:text-base"
              required
            />
          </div>

          {message && <p className="text-green-600 bg-green-50 p-2 sm:p-3 rounded-lg flex items-center text-sm sm:text-base"><Save className="w-4 h-4 mr-2" />{message}</p>}
          {error && <p className="text-red-600 bg-red-50 p-2 sm:p-3 rounded-lg text-sm sm:text-base">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transform transition-transform duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Lock className="w-5 h-5" />
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffProfileView;