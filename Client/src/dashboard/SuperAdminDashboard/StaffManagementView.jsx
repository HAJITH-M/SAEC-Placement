import { useState } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';

const StaffManagementView = ({ staff, onStaffCreated, onStaffRemoved }) => {
    const [newStaff, setNewStaff] = useState({ email: '', password: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewStaff((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    };
  
    const handleCreateStaff = async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
  
      try {
        const response = await axios.post(
          'http://localhost:9999/superadmin/createstaffs',
          [newStaff],
          { withCredentials: true }
        );
        console.log('Single staff creation response:', response.data);
        setSuccess('Staff created successfully!');
        setNewStaff({ email: '', password: '' });
        onStaffCreated();
      } catch (error) {
        console.error('Error creating staff:', error);
        if (error.response?.status === 409) {
          setError(error.response.data.error);
        } else {
          setError(error.response?.data?.error || 'Failed to create staff');
        }
      }
    };
  
    const handleUploadStaff = async (e) => {
      e.preventDefault();
      if (!file) {
        setError('Please select an Excel file');
        return;
      }
  
      setError(null);
      setSuccess(null);
  
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
  
          const staffArray = jsonData.map((row) => ({
            email: row.Email,
            password: row.Password,
          }));
  
          if (staffArray.length === 0 || !staffArray.every((s) => s.email && s.password)) {
            setError('Excel file must contain Email and Password columns with valid data');
            return;
          }
  
          try {
            const response = await axios.post(
              'http://localhost:9999/superadmin/createstaffs',
              staffArray,
              { withCredentials: true }
            );
            console.log('Bulk staff creation response:', response.data);
            const insertedCount = response.data.inserted.length;
            const skippedMessage = response.data.skipped;
            setSuccess(insertedCount > 0 
              ? `Successfully created ${insertedCount} staff member(s)${skippedMessage ? `. ${skippedMessage}` : ''}`
              : skippedMessage || 'No new staff added');
            setFile(null);
            // Reset the file input
            e.target.reset();
            onStaffCreated();
          } catch (error) {
            console.error('Error uploading staff:', error);
            setError(error.response?.data?.error || 'Failed to upload staff');
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Unexpected error during file read:', error);
        setError('Failed to process Excel file');
      }
    };
  
    const handleRemoveStaff = async (staffId) => {
      if (!staffId) {
        setError('Cannot remove staff: Staff ID is missing');
        return;
      }
  
      setError(null);
      setSuccess(null);
  
      console.log('Attempting to remove staff with ID:', staffId);
  
      try {
        const response = await axios.delete(
          `http://localhost:9999/superadmin/staff/${staffId}`,
          { withCredentials: true }
        );
        console.log('Staff removal response:', response.status);
        setSuccess('Staff removed successfully!');
        onStaffRemoved();
      } catch (error) {
        console.error('Error removing staff:', error);
        if (error.response?.status === 404) {
          setSuccess('Staff already removed or not found');
          onStaffRemoved();
        } else if (error.response?.status === 422) {
          setError('Invalid staff ID format');
        } else {
          setError(error.response?.data?.error || 'Failed to remove staff');
        }
      }
    };
  
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Staff Management</h2>
  
        {/* Single Staff Form */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Create Single Staff</h3>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={newStaff.email}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={newStaff.password}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
            >
              Create Staff
            </button>
          </form>
        </div>
  
        {/* Bulk Staff Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Multiple Staff (Excel)</h3>
          <form onSubmit={handleUploadStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="mt-1 block w-full p-2 border rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                File should contain columns: Email, Password (optional: Name)
              </p>
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
            >
              Upload Staff
            </button>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </form>
        </div>
  
        {/* Staff List */}
        <h3 className="text-lg font-semibold mb-2">Current Staff</h3>
        {staff.length > 0 ? (
          <ul>
            {staff.map((staffMember) => (
              <li
                key={staffMember.staffId || staffMember.userId}
                className="mb-2 flex justify-between items-center"
              >
                <span>
                  <strong>Name:</strong> {staffMember.name || 'N/A'} | <strong>Email:</strong> {staffMember.email}
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

  export default StaffManagementView;