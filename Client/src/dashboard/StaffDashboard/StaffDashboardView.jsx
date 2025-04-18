import React, { useState, useEffect } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Plus, LogOut, Users, Briefcase, ClipboardList, UserCircle, PlusCircle, Loader, Loader2, Loader2Icon, MessageCircle } from "lucide-react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import StaffProfileView from "./StaffProfileView";
import StaffStudentAddView from "./StaffStudentAddView";
import StaffStudentSeeView from "./StaffStudentSeeView";
import StaffJobAddView from "./StaffJobAddView";
import StaffSeeRegistrations from "./StaffSeeRegistrations";
import StaffStudentManagementView from "./StaffStudentManagementView";
import StaffEventAdd from "./StaffEventAdd";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { fetchData, postData } from "../../services/apiService";
import StaffHomeView from "./StaffHomeView";
import ContactInfo from "../../components/Contacts/ContactInfo";

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
        className="mt-2 text-sm text-orange-500 underline"
      >
        Download Interested Students List
      </CSVLink>
    </div>
  );
};

const StaffDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [interestedStudents, setInterestedStudents] = useState({});
  const [staffDetails, setStaffDetails] = useState({ email: "", name: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        const response = await fetchData("/staff", { withCredentials: true });
        const { staff } = response.data;
        setStaffDetails({
          email: staff.email || "",
          name: staff.name || "",
          department: staff.department || "",
        });
      } catch (error) {
        setStaffDetails({ email: "staff@example.com", name: "", department: "Unknown" });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, []);

  const firstLetter = staffDetails.email ? staffDetails.email.charAt(0).toUpperCase() : "";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <StaffHomeView />;
      case "addStudent":
        return <StaffStudentAddView />;
      case "addJob":
        return <StaffJobAddView />;
      case "jobRegisteredStudents":
        return <StaffSeeRegistrations />;
      case "profile":
        return <StaffProfileView staffDetails={staffDetails} />;
      case "contact":
        return <ContactInfo />;
      case "viewStudents":
        return <StaffStudentSeeView />;
      case "studentManagement":
        return <StaffStudentManagementView />;
      case "staffeventadd":
        return <StaffEventAdd />;
      default:
        return <StaffHomeView />;
    }
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  };

  const handleLogout = async () => {
    try {
      const response = await postData("/staff/logout", {}, { withCredentials: true });
      if (response.data.message === "Logged out successfully" || response.status === 200) {
        navigate("/auth/staff");
        toast.success("Logged out successfully")
        
      }
    } catch (error) {
      return toast.error("Error logging out");
    }
  };
  
  if (loading) {
    return(

          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin text-orange-500" size={48} />
          </div>

          
    )
  }

  return (
    <div className="flex relative">
      <div
        className={`fixed lg:static lg:translate-x-0 z-40 w-64 h-screen shadow-xl bg-white text-orange-500 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute right-4 top-4 p-2 cursor-pointer rounded-md bg-orange-500 text-white"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">Welcome Back, Staff!</h2>
              <div className="flex items-center mt-2">
                <div className="w-8 h-8 mt-1 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 overflow-hidden">
                  <span className="text-lg">{firstLetter || "?"}</span>
                </div>
                <div className="flex flex-col">
                <span className="text-sm text-gray-600 truncate w-full block" style={{ minWidth: "150px" }}>{staffDetails.email || "No email available"}</span>
                <span className="text-xs text-gray-600">{staffDetails.department || "Unknown"} Staff</span>
                </div>
              </div>
            </div>
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "home" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("home");
                setIsOpen(false);
              }}
            >
              <Home size={20} className={activeComponent === "home" ? "text-white" : "text-orange-500"} />
              <span>Home</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "studentManagement" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("studentManagement");
                setIsOpen(false);
              }}
            >
              <Users size={20} className={activeComponent === "studentManagement" ? "text-white" : "text-orange-500"} />
              <span>Student Management</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "addJob" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("addJob");
                setIsOpen(false);
              }}
            >
              <Briefcase size={20} className={activeComponent === "addJob" ? "text-white" : "text-orange-500"} />
              <span>Post Job</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "staffeventadd" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("staffeventadd");
                setIsOpen(false);
              }}
            >

              <PlusCircle size={20} className={activeComponent === "staffeventadd" ? "text-white" : "text-orange-500"} />
              <span>Event Add</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "jobRegisteredStudents" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("jobRegisteredStudents");
                setIsOpen(false);
              }}
            >
              <ClipboardList size={20} className={activeComponent === "jobRegisteredStudents" ? "text-white" : "text-orange-500"} />
              <span>Registered Students</span>
            </div>

            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${activeComponent === "profile" ? "bg-orange-500 text-white" : "text-black"
                }`}
              onClick={() => {
                setActiveComponent("profile");
                setIsOpen(false);
              }}
            >

              <UserCircle size={20} className={activeComponent === "profile" ? "text-white" : "text-orange-500"} />
              <span>Profile</span>
            </div>

            <div
                className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                  activeComponent === "contact" ? "bg-orange-500 text-white" : "text-black"
                }`}
                onClick={() => {
                  setActiveComponent("contact");
                  setIsOpen(false);
                }}
              >
                <MessageCircle size={20} className={activeComponent === "contact" ? "text-white" : "text-orange-500"} />
                <span>Contact</span>              
              </div>

            <div
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-red-500 hover:text-white rounded transition-all duration-200 text-black"
            >
              <LogOut size={20} className="text-red-500" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:ml-0 ml-0 mt-16 lg:mt-0 bg-slate-100 overflow-y-auto h-screen">
        {error && <div className="p-4 text-red-500">{error}</div>} {/* Display error */}
        {renderComponent()}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {!isOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold text-black">Staff Dashboard</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md cursor-pointer bg-orange-500 text-white"
          >
            <Menu size={16} />
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};


export default StaffDashboardView;