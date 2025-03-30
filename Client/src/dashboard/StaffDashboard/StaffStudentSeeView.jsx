import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, Filter, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteData, fetchData } from "../../services/apiService";

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
  const [viewMode, setViewMode] = useState("your");
  const [selectedStudentId, setSelectedStudentId] = useState(null); // New state for selected row

  useEffect(() => {
    const fetchDataStudent = async () => {
      try {
        const studentsResponse = await fetchData("/staff", {
          withCredentials: true,
        });
        const { staffEmail, allStudents: all, yourStudents: yours } = studentsResponse.data;
        setCurrentStaffEmail(staffEmail);
        console.log("Current ssssss", studentsResponse);

        const filteredStudents = {};
        Object.entries(all || {}).forEach(([dept, batches]) => {
          const filteredBatches = {};
          Object.entries(batches).forEach(([batch, students]) => {
            const filteredBatchStudents = students.filter(
              (student) => student.staffEmail === staffEmail
            );
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
    fetchDataStudent();
  }, []);

  const handleRemoveStudent = async (studentId) => {
    try {
      setLoading(true);
      await deleteData(`/staff/student/${studentId}`, {
        withCredentials: true,
      });

      setAllStudents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dept) => {
          Object.keys(updated[dept]).forEach((batch) => {
            updated[dept][batch] = updated[dept][batch].filter(
              (student) => student.studentId !== studentId
            );
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
            updated[dept][batch] = updated[dept][batch].filter(
              (student) => student.studentId !== studentId
            );
            if (updated[dept][batch].length === 0) delete updated[dept][batch];
          });
          if (Object.keys(updated[dept]).length === 0) delete updated[dept];
        });
        return updated;
      });

      setStudentToRemove(null);
      setSuccess("Student removed successfully");
      toast.success("Student removed successfully");
      setError(null);
      setSelectedStudentId(null); // Reset selection when student is removed
    } catch (err) {
      console.error("Error removing student:", err);
      setError(err.response?.data?.error || "Failed to remove student");
      toast.error("Failed to remove student");
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
              student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.cgpa ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.tenthMark ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.twelfthMark ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.noOfArrears ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.phoneNumber ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.skillSet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.languagesKnown?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.linkedinUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.githubUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.companyPlacedIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(student.placedStatus === "yes" ? "yes" : "no")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
          }
          if (filterBy === "placed") {
            const placedStatus = student.placedStatus === "yes" ? "yes" : "no";
            return placedStatus.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return String(student[filterBy] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
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

  const handleRowClick = (studentId) => {
    setSelectedStudentId(studentId === selectedStudentId ? null : studentId); // Toggle selection
  };

  return (
    <div className="w-full min-h-screen p-2 sm:p-4">
      {/* Search Section */}
      <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={20} className="text-orange-500" />
          Search Students
        </h2>

        <div className="lg:flex lg:flex-row sm:flex-row gap-2 mb-4 grid grid-cols-2 ">
          <button
            onClick={() => setViewMode("your")}
            className={`w-full sm:w-auto px-4 py-2 rounded ${
              viewMode === "your" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            Your Students
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`w-full sm:w-auto px-4 py-2 rounded ${
              viewMode === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Students
          </button>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex items-center border rounded p-1.5 w-1/2">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full focus:outline-none text-sm"
            >
              <option value="all">All Fields</option>
              <option value="email">Email</option>
              <option value="regNo">Registration Number</option>
              <option value="name">Name</option>
              <option value="batch">Batch</option>
              <option value="department">Department</option>
              <option value="cgpa">CGPA</option>
              <option value="tenthMark">10th Mark</option>
              <option value="twelfthMark">12th Mark</option>
              <option value="noOfArrears">No. of Arrears</option>
              
            </select>
          </div>

          <div className="flex items-center w-4/2 border rounded p-1.5">
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

      {/* Loading State */}
      {loading && (
        <div className="w-full p-4 mb-4 bg-gray-100 text-gray-700 rounded text-center">
          Loading...
        </div>
      )}

      {/* Students Section */}
      <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          {viewMode === "your" ? "Your Students" : "All Students"} by Department and Batch
        </h3>
        {Object.keys(filterStudents(viewMode === "your" ? yourStudents : allStudents)).length ===
        0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No students found.</p>
          </div>
        ) : (
          Object.entries(filterStudents(viewMode === "your" ? yourStudents : allStudents)).map(
            ([dept, batches]) => (
              <div key={dept} className="mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Department: {dept}
                </h4>
                <div className="mb-4">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="border rounded p-2 w-full sm:w-48 text-sm"
                  >
                    <option value="">Select Batch</option>
                    {Object.keys(batches).map((batch) => (
                      <option key={batch} value={batch}>
                        Batch {batch}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBatch && batches[selectedBatch] && (
                  <div className="w-full overflow-x-auto rounded-lg border mb-4">
                    <h5 className="text-sm sm:text-md font-medium text-gray-700 p-2 bg-gray-50">
                      Batch {selectedBatch} [{batches[selectedBatch].length}]
                    </h5>
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Name
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Email
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Reg. No
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Roll No
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Batch
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Dept
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            CGPA
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            10th
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            12th
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Arrears
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Phone
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Skills
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Languages
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            LinkedIn
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            GitHub
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Company
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Status
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Staff
                          </th>
                          <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {batches[selectedBatch].map((student) => (
                          <tr
                            key={student.studentId}
                            onClick={() => handleRowClick(student.studentId)}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              selectedStudentId === student.studentId ? "bg-yellow-100" : ""
                            }`}
                          >
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.name || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.email}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.regNo || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.rollNo || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.batch || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.department || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.cgpa ?? "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.tenthMark ?? "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.twelfthMark ?? "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.noOfArrears ?? "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.phoneNumber ?? "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.skillSet || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.languagesKnown || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.linkedinUrl ? (
                                <a
                                  href={student.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
                                >
                                  Link
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.githubUrl ? (
                                <a
                                  href={student.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                  onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
                                >
                                  Link
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.companyPlacedIn || "N/A"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.placedStatus === "yes" ? (
                                <span className="text-green-600">Placed</span>
                              ) : (
                                <span className="text-red-600">Not Placed</span>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                              {student.staffEmail || "Unassigned"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when clicking button
                                  setStudentToRemove(student);
                                }}
                                className="flex items-center gap-1.5 bg-red-500 text-white py-1 px-2 sm:py-1.5 sm:px-3 rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
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
            )
          )
        )}
      </div>

      {/* Confirmation Modal */}
      {studentToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to remove "
              <span className="font-medium">{studentToRemove.email}</span>"? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setStudentToRemove(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(studentToRemove.studentId)}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
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