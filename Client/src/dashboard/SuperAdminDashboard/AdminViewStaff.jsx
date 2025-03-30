import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, Filter, Trash2 } from "lucide-react";
import { deleteData, fetchData } from "../../services/apiService";

const AdminViewStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("name");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // Added state for selected row

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetchData("/superadmin", {
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

  const handleDeleteClick = (staffId, name) => {
    setStaffToDelete({ staffId, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await deleteData(
        `/superadmin/staff/${staffToDelete.staffId}`,
        { withCredentials: true }
      );
      setSuccess("Staff removed successfully!");
      fetchStaff();
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
    } finally {
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const filterStaff = (staff) => {
    if (!searchTerm) return staff;
    return staff.filter((member) => {
      if (filterBy === "all") {
        return (
          member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return String(member[filterBy] || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleRowClick = (staffId) => {
    setSelectedRow(staffId === selectedRow ? null : staffId); // Toggle selection
  };

  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, staffName }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Are you sure you want to remove "<span className="font-medium">{staffName}</span>"?
            This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen p-2 sm:p-4">
      <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={20} className="text-orange-500" />
          Search Staff
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center border rounded p-1.5 w-full sm:w-1/4">
            <Filter size={16} className="text-orange-500 mr-1.5" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full focus:outline-none text-sm"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="department">Department</option>
            </select>
          </div>

          <div className="flex items-center w-full sm:flex-1 border rounded p-1.5">
            <Search size={16} className="text-orange-500 mr-1.5" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="w-full p-4 mb-4 bg-gray-100 text-gray-700 rounded text-center">
          Loading...
        </div>
      )}
      {error && (
        <div className="w-full p-4 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full p-4 mb-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-6">
        {filterStaff(staff).length > 0 ? (
          <div className="w-full overflow-x-auto rounded-lg border">
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
                    Department
                  </th>
                  <th className="px-2 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filterStaff(staff).map((staffMember) => (
                  <tr
                    key={staffMember.staffId || staffMember.userId}
                    onClick={() => handleRowClick(staffMember.staffId || staffMember.userId)}
                    className={`cursor-pointer transition-colors ${
                      selectedRow === (staffMember.staffId || staffMember.userId)
                        ? "bg-yellow-100 hover:bg-yellow-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                      {staffMember.name || "N/A"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 break-all">
                      {staffMember.email}
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                      {staffMember.department || "N/A"}
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking button
                          handleDeleteClick(staffMember.staffId, staffMember.name);
                        }}
                        className="flex items-center gap-1.5 bg-red-500 text-white py-1 px-2 sm:py-1.5 sm:px-3 rounded hover:bg-red-600 transition-colors text-xs sm:text-sm"
                        disabled={!staffMember.staffId}
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No staff members found.</p>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        staffName={staffToDelete?.name}
      />
    </div>
  );
};

export default AdminViewStaff;