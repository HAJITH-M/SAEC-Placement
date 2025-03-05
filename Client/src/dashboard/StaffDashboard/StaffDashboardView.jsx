import React, { useState, useEffect } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Plus } from "lucide-react";
import { CSVLink } from "react-csv";
import AddStudentView from "./AddStudentView";
import axios from "axios";

// ExportCSV Component to handle CSV generation
const ExportCSV = ({ job, interestedStudents }) => {
  const prepareCsvData = () => {
    if (!interestedStudents) return [];
    return interestedStudents.map((student) => ({
      name: student.name,
      email: student.email,
      jobTitle: job.title,
      company: job.company,
    }));
  };

  return (
    <div className="mt-4">
      <CSVLink
        data={prepareCsvData()}
        filename={`${job.title}-interested-students.csv`}
        className="mt-2 text-sm text-blue-500 underline"
      >
        Download Interested Students List
      </CSVLink>
    </div>
  );
};

// StaffDashboardView Component
const StaffDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [interestedStudents, setInterestedStudents] = useState({});
  const [staffDetails, setStaffDetails] = useState({ email: "", name: "" });
  const [loading, setLoading] = useState(true);

  // Example job data (replace with API call if needed)
  const jobs = [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      status: "Registered",
      jobLink: "https://example.com",
    },
    {
      title: "Frontend Developer",
      company: "Web Solutions",
      status: "Open",
      jobLink: "https://example.com",
    },
  ];

  // Fetch staff details on mount
  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await axios.get("http://localhost:9999/staff", { withCredentials: true });
        const { staff } = response.data; // Destructure 'staff' from response
        setStaffDetails({
          email: staff.email || "",
          name: staff.name || "",
        });
      } catch (error) {
        console.error("Error fetching staff details:", error);
        setStaffDetails({ email: "staff@example.com", name: "" }); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, []);

  const firstLetter = staffDetails.email ? staffDetails.email.charAt(0).toUpperCase() : "";

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Render the correct component based on the activeComponent state
  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <HomeComponent />;
      case "addStudent":
        return <AddStudentView />;
      case "addJob":
        return <AddJobView />;
      case "profile":
        return <StaffProfileView staffDetails={staffDetails} />;
      case "help":
        return <StaffHelpView />;
      default:
        return <HomeComponent />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:translate-x-0 z-40 w-64 h-screen bg-white text-blue-500 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute right-4 top-4 p-2 rounded-md bg-orange-500 text-white"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">Welcome Back, Staff!</h2>
              <div className="flex items-center mt-2">
                <div className="w-9 h-9 mt-1 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2">
                  {firstLetter || "?"}
                </div>
                <div className="flex flex-col">
                  <span className="text-base text-gray-600">{staffDetails.email || "Unknown"}</span>
                  <span className="text-xs text-gray-600">Staff</span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "home" ? "bg-orange-500 text-white" : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("home");
                setIsOpen(false);
              }}
            >
              <Home size={20} className={activeComponent === "home" ? "text-white" : "text-blue-500"} />
              <span>Home</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "addStudent" ? "bg-orange-500 text-white" : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("addStudent");
                setIsOpen(false);
              }}
            >
              <Plus size={20} className={activeComponent === "addStudent" ? "text-white" : "text-blue-500"} />
              <span>Add Student</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "addJob" ? "bg-orange-500 text-white" : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("addJob");
                setIsOpen(false);
              }}
            >
              <FileText size={20} className={activeComponent === "addJob" ? "text-white" : "text-blue-500"} />
              <span>Add Job Opportunity</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "profile" ? "bg-orange-500 text-white" : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("profile");
                setIsOpen(false);
              }}
            >
              <User size={20} className={activeComponent === "profile" ? "text-white" : "text-blue-500"} />
              <span>Profile</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "help" ? "bg-orange-500 text-white" : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("help");
                setIsOpen(false);
              }}
            >
              <HelpCircle size={20} className={activeComponent === "help" ? "text-white" : "text-blue-500"} />
              <span>Help</span>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Button and Dashboard Title */}
      {!isOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold text-black">Staff Dashboard</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-orange-500 text-white"
          >
            <Menu size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Home Component
const HomeComponent = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Home</h2>
    <p>Welcome to the staff dashboard. Use the menu to manage students and job opportunities.</p>
  </div>
);

// Add Job View Component
const AddJobView = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Add New Job Opportunity</h2>
    <form>
      <input
        type="text"
        placeholder="Job Title"
        className="w-full p-3 mb-4 border border-gray-300 rounded"
      />
      <textarea
        placeholder="Job Description"
        className="w-full p-3 mb-4 border border-gray-300 rounded"
      />
      <button type="submit" className="w-full p-3 bg-orange-500 text-white rounded">Add Job Opportunity</button>
    </form>
  </div>
);

// Help Component
const StaffHelpView = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
    <p>If you need help, here are some resources for you.</p>
  </div>
);

// Staff Profile View Component with Password Update
const StaffProfileView = ({ staffDetails }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.patch(
        "http://localhost:9999/staff/updatepassword",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Staff Profile</h2>
      <div className="mb-6">
        <p className="text-gray-600">
          <strong>Email:</strong> {staffDetails.email || "Unknown"}
        </p>
        <p className="text-gray-600">
          <strong>Name:</strong> {staffDetails.name || "Not set"}
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Update Password</h3>
      <form onSubmit={handlePasswordUpdate}>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded"
            required
          />
        </div>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default StaffDashboardView;