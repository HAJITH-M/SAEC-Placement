import React, { useState } from "react";
import { Home, User, FileText, HelpCircle, Menu, X, Code2, Calendar } from "lucide-react";
import StudentProfileView from "./StudentProfileView";
import StudentJobView from "./StudentJobView";
import StudentEventView from "./StudentEventView";

const StudentDashboardView = () => {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const userEmail = "user@example.com"; // This should be replaced with actual user email from your auth system
  const firstLetter = userEmail.charAt(0).toUpperCase();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "home":
        return <HomeComponent />;
      case "profile":
        return <StudentProfileView />;
      case "jobview":
        return <StudentJobView />;
      case "events":
        return <StudentEventView />;
      case "help":
        return <HelpComponent />;
      default:
        return <HomeComponent />;
    }
  };

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div className={`
        fixed lg:static lg:translate-x-0 z-40 w-64 h-screen bg-white text-orange-500 transform transition-transform duration-300 ease-in-out
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
            </div>
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "home"
                  ? "bg-orange-500 text-white"
                  : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("home");
                setIsOpen(false);
              }}
            >
              <Home
                size={20}
                className={
                  activeComponent === "home" ? "text-white" : "text-orange-500"
                }
              />
              <span>Home</span>
            </div>
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "jobview"
                  ? "bg-orange-500 text-white"
                  : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("jobview");
                setIsOpen(false);
              }}
            >
              <FileText
                size={20}
                className={
                  activeComponent === "jobview"
                    ? "text-white"
                    : "text-orange-500"
                }
              />
              <span>Job View</span>
            </div>
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "profile"
                  ? "bg-orange-500 text-white"
                  : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("profile");
                setIsOpen(false);
              }}
            >
              <User
                size={20}
                className={
                  activeComponent === "profile"
                    ? "text-white"
                    : "text-orange-500"
                }
              />
              <span>Profile</span>
            </div>
           
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "events"
                  ? "bg-orange-500 text-white"
                  : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("events");
                setIsOpen(false);
              }}
            >
              <Calendar
                size={20}
                className={
                  activeComponent === "events"
                    ? "text-white"
                    : "text-orange-500"
                }
              />
              <span>Events</span>
            </div>
            <div
              className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-orange-500 hover:text-white rounded transition-all duration-200 ${
                activeComponent === "help"
                  ? "bg-orange-500 text-white"
                  : "text-black"
              }`}
              onClick={() => {
                setActiveComponent("help");
                setIsOpen(false);
              }}
            >
              <HelpCircle
                size={20}
                className={
                  activeComponent === "help" ? "text-white" : "text-orange-500"
                }
              />
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
  );
};

const HomeComponent = () => (
  <>
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Home</h2>
      <p>Your Home information goes here.</p>
    </div>
  </>
);


const SettingsComponent = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p>Manage your settings here.</p>
  </div>
);

const HelpComponent = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
    <p>Need help? Find resources and support here.</p>
  </div>
);

export default StudentDashboardView;
