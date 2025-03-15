import React, { useState, useEffect } from "react";
import axios from "axios";

const StaffStudentSeeView = () => {
  const [allStudents, setAllStudents] = useState({});
  const [yourStudents, setYourStudents] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [currentStaffEmail, setCurrentStaffEmail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { staffEmail, allStudents: all, yourStudents: yours } = studentsResponse.data;
        setCurrentStaffEmail(staffEmail);
        console.log("Current Staff Email:", staffEmail);
        setAllStudents(all || {});
        setYourStudents(yours || {});
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
      const response = await axios.delete(`http://localhost:9999/staff/student/${studentId}`, {
        withCredentials: true,
      });
      console.log(`Student ${studentId} removed successfully`);
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
        Object.keys(updated).forEach((batch) => {
          updated[batch] = updated[batch].filter((student) => student.studentId !== studentId);
          if (updated[batch].length === 0) delete updated[batch];
        });
        return updated;
      });
      setStudentToRemove(null);
      setMessage("Student removed successfully");
    } catch (err) {
      console.error("Error removing student:", err.response?.data || err.message);
      const errorMsg = err.response?.status === 404 
        ? "Student not found in database" 
        : err.response?.data?.errors?.[0]?.message || "Failed to remove student";
      setError(errorMsg);
    } finally {
      setLoading(false);
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
      {/* All Students by Department and Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">All Students by Department and Batch</h3>
        {Object.keys(allStudents).length === 0 ? (
          <p className="text-gray-600">No students in your department yet.</p>
        ) : (
          Object.entries(allStudents).map(([dept, batches]) => (
            <div key={dept} className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Department: {dept}
              </h4>
              {Object.entries(batches).map(([batch, batchStudents]) => (
                <div key={batch} className="mb-4 ml-4">
                  <h5 className="text-md font-medium text-gray-700">
                    Batch {batch} [{batchStudents.length}]
                  </h5>
                  <ul className="space-y-2">
                    {batchStudents.map((student) => (
                      <li
                        key={student.studentId}
                        className="flex justify-between items-center p-2 border-b border-gray-200"
                      >
                        <span>
                          {student.email} (Added by: {student.staffEmail || "Unknown"}, Dept: {student.department || "Unknown"})
                        </span>
                        <button
                          onClick={() => confirmRemove(student)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Your Students by Batch */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Your Students by Batch</h3>
        {Object.keys(yourStudents).length === 0 ? (
          <p className="text-gray-600">You haven’t added any students yet.</p>
        ) : (
          Object.entries(yourStudents).map(([batch, batchStudents]) => (
            <div key={batch} className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Batch {batch} [{batchStudents.length}]
              </h4>
              <ul className="space-y-2">
                {batchStudents.map((student) => (
                  <li
                    key={student.studentId}
                    className="flex justify-between items-center p-2 border-b border-gray-200"
                  >
                    <span>
                      {student.email} (Added by: {student.staffEmail || "Unknown"}, Dept: {student.department || "Unknown"})
                    </span>
                    <button
                      onClick={() => confirmRemove(student)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
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
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(studentToRemove.studentId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default StaffStudentSeeView;