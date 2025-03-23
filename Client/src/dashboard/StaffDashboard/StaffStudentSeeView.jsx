import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, Filter, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const StaffStudentSeeView = () => {
  const [allStudents, setAllStudents] = useState({});
  const [yourStudents, setYourStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("email");
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewMode, setViewMode] = useState("your"); // Add this state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { staffEmail, allStudents: all, yourStudents: yours } = studentsResponse.data;
        setCurrentStaffEmail(staffEmail);
        
        // Filter allStudents to get only students added by current staff
        const filteredStudents = {};
        Object.entries(all || {}).forEach(([dept, batches]) => {
          const filteredBatches = {};
          Object.entries(batches).forEach(([batch, students]) => {
            const filteredBatchStudents = students.filter(student => student.staffEmail === staffEmail);
            if (filteredBatchStudents.length > 0) {
              filteredBatches[batch] = filteredBatchStudents;
            }
          });
          if (Object.keys(filteredBatches).length > 0) {
            filteredStudents[dept] = filteredBatches;
          }
        });
        
        setAllStudents(all || {});

        setYourStudents(filteredStudents);
        setError(null);


        console.log("All Students:", studentsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRemoveStudent = async (studentId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:9999/staff/student/${studentId}`, {
        withCredentials: true,
      });
      
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



        Object.keys(updated).forEach((dept) => {
          Object.keys(updated[dept]).forEach((batch) => {
            updated[dept][batch] = updated[dept][batch].filter((student) => student.studentId !== studentId);
            if (updated[dept][batch].length === 0) delete updated[dept][batch];
          });
          if (Object.keys(updated[dept]).length === 0) delete updated[dept];
        });
        return updated;
      });
      
      setStudentToRemove(null);
      setSuccess("Student removed successfully");
      toast.success("Student removed successfully")
      setError(null);
    } catch (err) {
      console.error("Error removing student:", err);
      setError(err.response?.data?.error || "Failed to remove student");
      toast.error("Failed to remove student")
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = (students) => {
    if (!searchTerm) return students;
    
    const filteredDepts = {};
    Object.entries(students).forEach(([dept, batches]) => {
      const filteredBatches = {};
      Object.entries(batches).forEach(([batch, batchStudents]) => {
        const filtered = batchStudents.filter((student) => {
          if (filterBy === "all") {
            return (
              student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||

              String(student.placed === "yes" ? "yes" : "no").toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (filterBy === "placed") {
            const placedStatus = student.placed === "yes" ? "yes" : "no";
            return placedStatus.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return String(student[filterBy] || "").toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (filtered.length > 0) {
          filteredBatches[batch] = filtered;
        }
      });
      if (Object.keys(filteredBatches).length > 0) {
        filteredDepts[dept] = filteredBatches;
      }
    });
    return filteredDepts;
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={24} className="text-orange-500" />
          Search Students
        </h2>

        <div className="flex flex-row gap-2 mb-4">
          <button
            onClick={() => setViewMode("your")}
            className={`px-4 py-2 rounded ${
              viewMode === "your" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            Your Students
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded ${
              viewMode === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Students
          </button>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex items-center border rounded p-1.5 w-1/4">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full focus:outline-none text-sm"
            >
              <option value="all">All Fields</option>
              <option value="email">Email</option>
              <option value="regNo">Registration Number</option>
              <option value="placed">Placement Status</option>
            </select>
          </div>

          <div className="flex items-center flex-1 border rounded p-1.5">
            <Search size={16} className="text-orange-500 mr-1.5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {loading && <div className="p-4 mb-4 bg-gray-100 text-gray-700 rounded">Loading...</div>}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        <h3 className="text-xl font-semibold mb-4">
          {viewMode === "your" ? "Your Students" : "All Students"} by Department and Batch
        </h3>
        {Object.keys(filterStudents(viewMode === "your" ? yourStudents : allStudents)).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No students found.</p>
          </div>
        ) : (


          Object.entries(filterStudents(viewMode === "your" ? yourStudents : allStudents)).map(([dept, batches]) => (
            <div key={dept} className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Department: {dept}</h4>
              <div className="mb-4">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="border rounded p-2 w-48"
                >
                  <option value="">Select Batch</option>
                  {Object.keys(batches).map((batch) => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  ))}
                </select>
              </div>
              {selectedBatch && batches[selectedBatch] && (
                <div className="overflow-x-auto rounded-lg border mb-4">
                  <h5 className="text-md font-medium text-gray-700 p-2 bg-gray-50">
                    Batch {selectedBatch} [{batches[selectedBatch].length}]
                  </h5>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reg. No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Placement Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Added By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {batches[selectedBatch].map((student) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{student.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.regNo || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">

                            {student.placedStatus}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.staffEmail || "Unknown"}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => setStudentToRemove(student)}
                              className="flex items-center gap-1.5 bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 transition-colors text-sm"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {studentToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "<span className="font-medium">{studentToRemove.email}</span>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStudentToRemove(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(studentToRemove.studentId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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

export default StaffStudentSeeView;