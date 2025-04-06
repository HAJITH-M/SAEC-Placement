import React, { useState, useEffect } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Calendar, LogOut, Users } from "lucide-react";
import { Helmet } from "react-helmet";
import StudentProfileView from "./StudentProfileView";
import StudentJobView from "./StudentJobView";
import StudentEventView from "./StudentEventView";
import { useNavigate } from "react-router-dom";
import PlacedStudents from "../../components/PlacedStudents/PlacedStudents";
import PlacementStats from "../../components/PlacementStats/PlacementStatsView";
import RecentPlacements from "../../components/RecentPlacements/RecentPlacementsView";
import HomeVM from "../../pages/HomePage/HomeVM";
import { fetchData, postData } from "../../services/apiService";
import StudentHelpView from "./StudentHelpView";
import OurDevelopers from "../../components/OurDevelopers/OurDevelopers";

const StudentDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(""); // Dynamic email from session
  const [fetchError, setFetchError] = useState(null); // Error state
  const navigate = useNavigate();

  const firstLetter = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  // Fetch email from session on mount
  useEffect(() => {
    const fetchSessionEmail = async () => {
      try {
        const response = await fetchData("/student", {
          withCredentials: true, // Send cookies (student_session)
        });
        console.log("Full session response:", response);
        console.log("Session data:", response.data);
        if (response.data.success) {
          if (response.data.student && response.data.student.email) {
            setUserEmail(response.data.student.email);
          } else {
            setFetchError("No email found in session response");
            setUserEmail("user@example.com");
          }
        } else {
          throw new Error(response.data.error || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching session email:", error.response || error.message);
        setFetchError(error.response?.data?.error || error.message || "Failed to fetch session data");
        setUserEmail("user@example.com"); // Fallback
        navigate("/auth/student"); // Redirect to correct login route
      }
    };

    fetchSessionEmail();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return (
            <HomeComponent />
        );
      case "profile":
        return <StudentProfileView />
          
      case "jobview":
        return <StudentJobView />;
      case "events":
        return <StudentEventView />;
      case "ourDevelopers":
        return <OurDevelopers />;
      case "help":
        return <HelpComponent />;
      default:
        return <HomeComponent />;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await postData("/student/logout", {}, { withCredentials: true });
      if (response.data.message === "Logged out successfully" || response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <>
      <div className="flex relative">
        {/* Sidebar */}
        <div
          className={`
            fixed lg:static lg:translate-x-0 z-40 w-64 h-screen bg-white text-orange-500 shadow-xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
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
                <h2 className="text-2xl font-bold text-black">Welcome Back!</h2>
                <div className="flex items-center mt-2">
                  <div className="w-9 h-9 mt-1 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2">
                    {firstLetter}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base text-gray-600">{userEmail}</span>
                    <span className="text-xs text-gray-600">Student</span>
                  </div>
                </div>
                {fetchError && (
                  <p className="text-red-500 text-sm mt-2">{fetchError}</p>
                )}
              </div>
              <div
                className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                  activeComponent === "home" ? "bg-orange-500 text-white" : "text-black"
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
                className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                  activeComponent === "jobview" ? "bg-orange-500 text-white" : "text-black"
                }`}
                onClick={() => {
                  setActiveComponent("jobview");
                  setIsOpen(false);
                }}
              >
                <FileText size={20} className={activeComponent === "jobview" ? "text-white" : "text-orange-500"} />
                <span>Job View</span>
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
                <User size={20} className={activeComponent === "profile" ? "text-white" : "text-orange-500"} />
                <span>Profile</span>
              </div>
              <div
                className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                  activeComponent === "events" ? "bg-orange-500 text-white" : "text-black"
                }`}
                onClick={() => {
                  setActiveComponent("events");
                  setIsOpen(false);
                }}
              >
                <Calendar size={20} className={activeComponent === "events" ? "text-white" : "text-orange-500"} />
                <span>Events</span>
              </div>
              <div
                className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                  activeComponent === "ourDevelopers" ? "bg-orange-500 text-white" : "text-black"
                }`}
                onClick={() => {
                  setActiveComponent("ourDevelopers");
                  setIsOpen(false);
                }}
              >

                <Users size={20} className={activeComponent === "ourDevelopers" ? "text-white" : "text-orange-500"} />
                <span>Our Developers</span>
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
                <HelpCircle size={20} className={activeComponent === "help" ? "text-white" : "text-orange-500"} />
                <span>Help</span>
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

        {/* Main Content */}
        <div className="flex-1  bg-slate-50 lg:ml-0 ml-0 mt-16 lg:mt-0 overflow-y-auto h-screen">
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
            <h2 className="text-xl font-bold text-black">Dashboard</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md bg-orange-500 text-white"
            >
              <Menu size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const HomeComponent = () => {
  const viewModel = HomeVM();  // renamed for clarity

  return(
    <>
      <div className={`w-full transition-margin duration-300 ease-in-out ${viewModel.isSidebarOpen ? 'lg:ml-0' : 'ml-0'} flex-1  lg:mt-0`}>
        <div className="text-orange-500 py-6 lg:py-12 px-4 shadow-xl bg-orange-500">
          <div className="container mx-auto text-center bg-orange-500">
            <h1 className="text-2xl lg:text-5xl font-bold lg:mb-4 text-white">Welcome to SAEC Placement Portal</h1>
            <p className="text-xl text-gray-200 mb-6">Shaping Careers, Building Futures</p>
          </div>
        </div>

        <PlacedStudents/>
        <PlacementStats />
        <RecentPlacements />
      </div>
    </>
  )
}

const HelpComponent = () => (
  <>
    <Helmet>
      <title>Help & Support | SAEC Placement Portal</title>
      <meta name="description" content="Get help and support for using the SAEC Placement Portal. Find resources and guidance for your placement journey." />
      <meta name="keywords" content="SAEC placements help, student support, placement guidance" />
    </Helmet>
    {/* <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
      <p>Need help? Find resources and support here.</p>
    </div> */}

    <StudentHelpView/>
  </>
);

export default StudentDashboardView;