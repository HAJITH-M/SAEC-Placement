import React, { useState } from "react";
import { HelpCircle, User, Briefcase, Calendar, AlertCircle, X, Search } from "lucide-react";

const StudentHelpView = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const helpSections = [
    {
      title: "Getting Started",
      icon: <HelpCircle className="w-5 h-5 mr-2 text-orange-500" />,
      content:
        "Welcome to the Student Portal! This platform helps you manage your profile, explore job opportunities, and register for events. Use the navigation menu to access different sections. If you're new, start by reviewing your profile to ensure your details are up-to-date.",
    },
    {
      title: "Managing Your Profile",
      icon: <User className="w-5 h-5 mr-2 text-orange-500" />,
      content: [
        "View Profile: Go to the Profile section to see your personal, academic, and professional details.",
        "Edit Details: Click the pencil icon next to fields like phone number, skills, or LinkedIn URL to update them. Note: Name, email, department, and batch are set by the system and cannot be changed.",
        "Upload Photo: Click 'Upload Photo' to add or update your profile picture.",
      ],
    },
    {
      title: "Finding Jobs",
      icon: <Briefcase className="w-5 h-5 mr-2 text-orange-500" />,
      content: [
        "Browse Jobs: Visit the Jobs section to see available opportunities. Each job shows company, title, location, salary, and status.",
        "Register: Click 'Register' (thumbs up) to apply for an open job. Confirm your choice in the pop-up.",
        "Decline: Click 'Decline' (thumbs down) to remove your application if registered.",
        "Status: Jobs can be 'Open,' 'Closed,' 'Registered,' or 'Registered and Closed' (if expired after registering).",
        "Filters: Use the buttons (All, Registered, Open, Closed) to sort jobs.",
      ],
    },
    {
      title: "Exploring Events",
      icon: <Calendar className="w-5 h-5 mr-2 text-orange-500" />,
      content: [
        "Browse Events: Check the Events section for upcoming activities. Each event shows a name, date, and image.",
        "View Images: Click an event image to enlarge it. Click outside to close.",
        "Register: If a 'Register Now' button is available, click it to visit the registration link in a new tab.",
        "No Events: If you see 'No events found,' check back later for updates.",
      ],
    },
    

  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Filter sections based on search term
  const filteredSections = helpSections.filter((section) => {
    const titleMatch = section.title.toLowerCase().includes(searchTerm);
    const contentMatch = Array.isArray(section.content)
      ? section.content.some((item) => item.toLowerCase().includes(searchTerm))
      : section.content.toLowerCase().includes(searchTerm);
    return titleMatch || contentMatch;
  });

  return (
    <div className="bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <HelpCircle className="w-6 h-6 mr-2" />
            Student Help Center
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-slate-100">
          {filteredSections.length > 0 ? (
            filteredSections.map((section, index) => (
              <section key={index}>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  {section.icon}
                  {section.title}
                </h2>
                {Array.isArray(section.content) ? (
                  <ul className="mt-2 list-disc pl-5 text-gray-700 space-y-2">
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        className="font-medium"
                      >
                        {item.replace(
                          new RegExp(searchTerm, "gi"),
                          (match) => `${match}`
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-gray-700">
                    {section.content.replace(
                      new RegExp(searchTerm, "gi"),
                      (match) => `${match}`
                    )}
                  </p>
                )}
              </section>
            ))
          ) : (
            <div className="text-center text-gray-600 text-lg">
              No matching help topics found. Try a different search term!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHelpView;