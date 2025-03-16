import React, { useState, useEffect } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Calendar, Users, LogOut } from "lucide-react";
import axios from 'axios';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import StudentManagementView from "./StudentManagementView";
import StaffManagementView from "./StaffManagementView";
import AdminJobPost from "./AdminJobPost";
import AdminJobRegistrations from "./AdminJobRegistrations";
import AdminHomeViewDashboard from "./AdminHomeView";

const SuperAdminDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const IdUUIDParamsSchema = z.object({
    staffId: z.string().uuid({ message: "Invalid UUID format" }),
  });

  const firstLetter = adminEmail ? adminEmail.charAt(0).toUpperCase() : "?";

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:9999/superadmin', {
        withCredentials: true,
      });
      console.log('Full /superadmin response:', response.data);
      if (response.data.success) {
        setStaffList(response.data.staff || []);
        setStudentList(response.data.students || []);
        setAdminEmail(response.data.email || "");
        console.log('Email set from /superadmin:', response.data.email);
      } else {
        throw new Error('Failed to fetch superadmin data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.response?.data || error.message);
      setError('Failed to load dashboard data');
      navigate('/auth/superadmin', { replace: true });
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:9999/auth/session', {
        withCredentials: true,
      });
      console.log('Full /auth/session response:', response.data);
      if (response.data.success && response.data.role === "super_admin") {
        setAdminEmail(response.data.email || "");
        console.log('Email set from /auth/session:', response.data.email);
      } else {
        throw new Error(`Invalid session or role: ${response.data.role || 'none'}`);
      }
    } catch (error) {
      console.error('Session check failed:', error.response?.data || error.message);
      setError('Session validation failed');
      navigate('/auth/superadmin', { replace: true });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([checkSession(), fetchData()]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, [navigate]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <AdminHomeViewDashboard/>
      case "students":
        return <StudentManagementView students={studentList} />;
      case "staff":
        return <StaffManagementView staff={staffList} onStaffCreated={fetchData} onStaffRemoved={fetchData} />;
      case "events":
        return <EventManagementView />;
      case "adminJobPost":
        return <AdminJobPost />;
      case "jobRegistrations":
        return <AdminJobRegistrations />;
      default:
        return <HomeComponent staffCount={staffList.length} studentCount={studentList.length} />;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:9999/superadmin/logout',
        {},
        { withCredentials: true }
      );
      if (response.data.message === "Logged out successfully") {
        navigate('/auth/superadmin', { replace: true });
      } else {
        throw new Error('Logout failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
      setError('Logout failed. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex relative">
      <div className={`
        fixed lg:static lg:translate-x-0 z-40 w-64 h-screen bg-white text-orange-500 transform transition-transform duration-300 ease-in-out
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
              <h2 className="text-2xl font-bold text-black">Welcome Admin!</h2>
              <div className="flex items-center mt-2">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  {firstLetter}
                </div>
                <div className="flex flex-col ml-2 min-w-0">
                  <span className="text-sm text-gray-600 truncate w-full block" style={{ minWidth: "150px" }}>{adminEmail || "No email available"}</span>
                  <span className="text-xs text-gray-600">Super Admin</span>
                </div>
              </div>
            </div>
            <div onClick={() => { setActiveComponent("home"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "home" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Home size={20} className={activeComponent === "home" ? "text-white" : "text-orange-500"} />
              <span>Dashboard</span>
            </div>
            <div onClick={() => { setActiveComponent("adminJobPost"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "adminJobPost" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Calendar size={20} className={activeComponent === "adminJobPost" ? "text-white" : "text-orange-500"} />
              <span>Post Job</span>
            </div>
            <div onClick={() => { setActiveComponent("jobRegistrations"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "jobRegistrations" ? "bg-orange-500 text-white" : "text-black"}`}>
              <FileText size={20} className={activeComponent === "jobRegistrations" ? "text-white" : "text-orange-500"} />
              <span>Job Registrations</span>
            </div>
            {/* <div onClick={() => { setActiveComponent("students"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "students" ? "bg-orange-500 text-white" : "text-black"}`}>
              <User size={20} className={activeComponent === "students" ? "text-white" : "text-orange-500"} />
              <span>Student Management</span>
            </div> */}
            <div onClick={() => { setActiveComponent("staff"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "staff" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Users size={20} className={activeComponent === "staff" ? "text-white" : "text-orange-500"} />
              <span>Staff Management</span>
            </div>
            <div onClick={() => { setActiveComponent("events"); setIsOpen(false); }} className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "events" ? "bg-orange-500 text-white" : "text-black"}`}>
              <Calendar size={20} className={activeComponent === "events" ? "text-white" : "text-orange-500"} />
              <span>Event Management</span>
            </div>
            <div onClick={handleLogout} className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-red-500 hover:text-white rounded transition-all duration-200 text-black">
              <LogOut size={20} className="text-red-500" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:ml-0 ml-0 mt-16 lg:mt-0 overflow-y-auto h-screen">
        {renderComponent()}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

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

const EventManagementView = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Event Management</h2>
    <p>Manage events here (placeholder).</p>
  </div>
);

export default SuperAdminDashboardView;