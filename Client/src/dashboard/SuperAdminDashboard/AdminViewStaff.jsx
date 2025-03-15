import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminViewStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9999/superadmin", {
        withCredentials: true,
      });
      setStaff(response.data.staff || []);
      setError(null);
    } catch (err) {
      console.error("Fetch Staff Error:", err);
      setError("Failed to fetch staff: " + (err.response?.data?.error || err.message));
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRemoveStaff = async (staffId) => {
    if (!staffId) {
      setError("Cannot remove staff: Staff ID is missing");
      return;
    }

    setError(null);
    setSuccess(null);

    console.log("Attempting to remove staff with ID:", staffId);

    try {
      const response = await axios.delete(
        `http://localhost:9999/superadmin/staff/${staffId}`,
        { withCredentials: true }
      );
      console.log("Staff removal response:", response.status);
      setSuccess("Staff removed successfully!");
      fetchStaff(); // Refresh staff list after removal
    } catch (error) {
      console.error("Error removing staff:", error);
      if (error.response?.status === 404) {
        setSuccess("Staff already removed or not found");
        fetchStaff();
      } else if (error.response?.status === 422) {
        setError("Invalid staff ID format");
      } else {
        setError(error.response?.data?.error || "Failed to remove staff");
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Current Staff</h3>
      {loading && <p className="text-gray-500">Loading staff...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {staff.length > 0 ? (
        <ul>
          {staff.map((staffMember) => (
            <li
              key={staffMember.staffId || staffMember.userId}
              className="mb-2 flex justify-between items-center"
            >
              <span>
                <strong>Name:</strong> {staffMember.name || "N/A"} |{" "}
                <strong>Email:</strong> {staffMember.email} |{" "}
                <strong>Department:</strong> {staffMember.department || "N/A"}
              </span>
              <button
                onClick={() => handleRemoveStaff(staffMember.staffId)}
                className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600"
                disabled={!staffMember.staffId}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No staff members found.</p>
      )}
    </div>
  );
};

export default AdminViewStaff;