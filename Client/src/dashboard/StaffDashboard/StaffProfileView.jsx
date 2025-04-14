import React, { useState } from "react";
import { Lock, Mail, User, Building2, KeyRound, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { patchData } from "../../services/apiService";

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
      const response = await patchData(
        "/staff/updatepassword",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage(response.data.message || "Password updated successfully");
      toast.success(response.data.message || "Updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update password";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 ">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Staff Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-sm sm:text-base text-gray-800 ml-6 sm:ml-8">{staffDetails.email || "Unknown"}</p>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Name</span>
                </div>
                <p className="text-sm sm:text-base text-gray-800 ml-6 sm:ml-8">{staffDetails.name || "Not set"}</p>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Department</span>
                </div>
                <p className="text-sm sm:text-base text-gray-800 ml-6 sm:ml-8">{staffDetails.department || "Not set"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Update Password</h3>
              </div>

              {error && (
                <div className="mb-4 p-2 sm:p-3 bg-red-50 text-red-700 rounded-md text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer py-2 sm:py-3 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StaffProfileView;