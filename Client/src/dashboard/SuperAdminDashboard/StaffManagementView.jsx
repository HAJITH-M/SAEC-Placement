import React, { useState } from "react";
import AdminAddStaff from "./AdminAddStaff";
import AdminViewStaff from "./AdminViewStaff";
import { ArrowLeft } from "lucide-react";

const StaffManagementView = () => {
  const [viewMode, setViewMode] = useState(null); // Default to null for initial state

  const handleBack = () => {
    setViewMode(null);
  };

  return (
    <div className="container mx-auto p-4">

      <div className="grid grid-cols-3  mb-4 gap-2">
        {viewMode && (
          <div>
            <button
              onClick={handleBack}
              className="py-2 px-4 rounded-md text-white bg-orange-400 hover:bg-orange-500 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
             
            </button>
          </div>
        )}

        <h2 className="text-2xl font-bold col-start-2 text-center">Staff Management</h2>
      </div>
      {!viewMode ? (
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setViewMode("add")}
            className="py-2 px-4 rounded-md text-white bg-orange-400 hover:bg-orange-500"
          >
            Add Staff
          </button>
          <button
            onClick={() => setViewMode("view")}
            className="py-2 px-4 rounded-md text-white bg-orange-400 hover:bg-orange-500"
          >
            View Staff
          </button>
        </div>
      ) : null}
      {viewMode && (
        <div className="bg-white p-6 rounded-lg shadow">
          {viewMode === "add" ? <AdminAddStaff /> : <AdminViewStaff />}
        </div>
      )}
    </div>
  );
};

export default StaffManagementView;