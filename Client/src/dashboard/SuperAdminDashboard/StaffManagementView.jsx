import React, { useState } from "react";
import AdminAddStaff from "./AdminAddStaff";
import AdminViewStaff from "./AdminViewStaff";
import { ArrowLeft, Users, Plus } from "lucide-react";

const StaffManagementView = () => {
  const [viewMode, setViewMode] = useState(null);

  const handleBack = () => {
    setViewMode(null);
  };

  return (
    <div className="w-full p-4 sm:p-6 mt-3">
      {/* Header Section */}
      <div className="relative flex items-center justify-between mb-3 sm:mb-8 w-full">
        {viewMode && (
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 sm:gap-5 px-3 sm:px-4 py-2 cursor-pointer text-stone-800 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <ArrowLeft className="w-5 sm:w-6 h-5 sm:h-6 cursor-pointer group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 text-center flex-grow tracking-tight">
          Staff Management
        </h2>
        {viewMode && <div className="w-10 sm:w-16"></div>} {/* Spacer for symmetry */}
      </div>

      {/* Main Content */}
      {!viewMode ? (
        <div className="flex flex-col items-center justify-center space-y-6 w-full">
          <div className="text-center">
            <p className="text-gray-600 text-base sm:text-lg">Manage your staff efficiently</p>
            <p className="text-gray-500 text-sm">Choose an action below to get started</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full">
            <button
              onClick={() => setViewMode("add")}
              className="group relative cursor-pointer flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 sm:w-6 h-5 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-base sm:text-lg font-semibold">Add Staff</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
            </button>
            <button
              onClick={() => setViewMode("view")}
              className="group relative flex-1 px-4 sm:px-6 cursor-pointer py-3 sm:py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 sm:w-6 h-5 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base sm:text-lg font-semibold">View Staff</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full p-0 sm:p-6 animate-fade-in">
          {viewMode === "add" ? <AdminAddStaff /> : <AdminViewStaff />}
        </div>
      )}
    </div>
  );
};

export default StaffManagementView;

// Add this CSS in your global stylesheet or as a styled component
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;