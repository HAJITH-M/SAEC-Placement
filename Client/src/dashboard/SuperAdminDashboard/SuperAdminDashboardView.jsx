import React, { useState, useEffect } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Calendar, Users } from "lucide-react";
import axios from 'axios';
import { z }  from 'zod'
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import StudentManagementView from "../StudentManagement/StudentManagementView";

const SuperAdminDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const navigate = useNavigate();
  const IdUUIDParamsSchema = z.object({
    staffId: z.string().uuid({ message: "Invalid UUID format" }),
  });

  const adminEmail = "admin@example.com"; // Replace with actual email from session
  const firstLetter = adminEmail.charAt(0).toUpperCase();

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:9999/superadmin', {
        withCredentials: true,
      });
      if (response.data.success) {
        console.log('Staff list from /superadmin:', response.data.staff);
        setStaffList(response.data.staff || []);
        setStudentList(response.data.students || []);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      navigate('/superadmin/login', { replace: true });
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <HomeComponent staffCount={staffList.length} studentCount={studentList.length} />;
      case "students":
        return <StudentManagementView students={studentList} />;
      case "staff":
        return <StaffManagementView staff={staffList} onStaffCreated={fetchData} onStaffRemoved={fetchData} />;
      case "events":
        return <EventManagementView />;
      case "help":
        return <HelpComponent />;
      default:
        return <HomeComponent staffCount={staffList.length} studentCount={studentList.length} />;
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:9999/auth/logout', {}, { withCredentials: true });
      navigate('/superadmin/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div className={`
        fixed lg:static lg:translate-x-0 z-40 w-96 h-screen bg-white text-orange-500 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 h-full overflow-y-auto">
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute right-4 top-4 p-2 rounded-md bg-orange-500 text-white"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">Super Admin Dashboard</h2>
              <div className="flex items-center mt-2">
                <div className="w-9 h-9 mt-1 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2">
                  {firstLetter}
                </div>
                <div className="flex flex-col">
                  <span className="text-base text-gray-600">{adminEmail}</span>
                  <span className="text-xs text-gray-600">Super Admin</span>
                </div>
              </div>
            </div>
            <div onClick={() => { setActiveComponent("home"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "home" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Home size={20} className={activeComponent === "home" ? "text-white" : "text-orange-500"} />
              <span>Dashboard</span>
            </div>
            <div onClick={() => { setActiveComponent("students"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "students" ? "bg-orange-500 text-white" : "text-black"}`}>
              <User size={20} className={activeComponent === "students" ? "text-white" : "text-orange-500"} />
              <span>Student Management</span>
            </div>
            <div onClick={() => { setActiveComponent("staff"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "staff" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Users size={20} className={activeComponent === "staff" ? "text-white" : "text-orange-500"} />
              <span>Staff Management</span>
            </div>
            <div onClick={() => { setActiveComponent("events"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "events" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Calendar size={20} className={activeComponent === "events" ? "text-white" : "text-orange-500"} />
              <span>Event Management</span>
            </div>
            <div onClick={() => { setActiveComponent("help"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "help" ? "bg-orange-500 text-white" : "text-black"}`}>
              <HelpCircle size={20} className={activeComponent === "help" ? "text-white" : "text-orange-500"} />
              <span>Help</span>
            </div>
            <div onClick={handleLogout} className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-red-500 hover:text-white rounded transition-all duration-200 text-black">
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:ml-0 ml-0 mt-16 lg:mt-0 overflow-y-auto h-screen">
        {renderComponent()}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Button and Dashboard Title */}
      {!isOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold text-black">Super Admin Dashboard</h2>
          <button onClick={toggleSidebar} className="p-2 rounded-md bg-orange-500 text-white">
            <Menu size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const HomeComponent = ({ staffCount, studentCount }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Super Admin Dashboard</h2>
    <p>Welcome to the super admin control panel. Manage students, staff, and system settings here.</p>
    <div className="mt-4">
      <p><strong>Total Staff:</strong> {staffCount}</p>
      <p><strong>Total Students:</strong> {studentCount}</p>
    </div>
  </div>
);

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

const EventManagementView = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Event Management</h2>
    <p>Manage events here (placeholder).</p>
  </div>
);

const HelpComponent = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
    <p>Need help? Find resources and support here.</p>
  </div>
);

export default SuperAdminDashboardView;