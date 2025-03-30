
import React, { useState } from "react";
import { ArrowLeft, Users, Plus } from "lucide-react";
import StaffStudentAddView from "./StaffStudentAddView";
import StaffStudentSeeView from "./StaffStudentSeeView";

const StaffStudentManagementView = () => {
  const [viewMode, setViewMode] = useState(null);

  const handleBack = () => {
    setViewMode(null);
  };

  return (
    <div className="container mx-auto p- mt-3 lg:p-6  min-h-screen">
      {/* Header Section */}
      <div className="relative flex items-center justify-between mb-3 lg:mb-8">
        {viewMode && (
          <button
            onClick={handleBack}
            className="group flex items-center gap-5 px-4 py-2  text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-stone-800 cursor-pointer" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <h2 className="text-xl justify-center flex lg:text-3xl font-bold text-gray-800 text-center flex-grow tracking-tight">
          Student Management
        </h2>
        {viewMode && <div className="w-16"></div>} {/* Spacer for symmetry */}
      </div>

      {/* Main Content */}
      {!viewMode ? (
        <div className="flex flex-col  items-center justify-center space-y-6 p-6">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Manage your students efficiently</p>
            <p className="text-gray-500 text-sm">Choose an action below to get started</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md">
            <button
              onClick={() => setViewMode("add")}
              className="group relative flex-1 px-6 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-lg font-semibold">Add Student</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
            </button>
            <button
              onClick={() => setViewMode("view")}
              className="group relative flex-1 px-6 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg font-semibold">View Students</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full  mx-auto p-0 animate-fade-in">
          {viewMode === "add" ? <StaffStudentAddView /> : <StaffStudentSeeView />}
        </div>
      )}
    </div>
  );
};

export default StaffStudentManagementView;

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
