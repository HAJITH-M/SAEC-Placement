import React from 'react';
import { FaHome, FaUserGraduate, FaBuilding, FaCalendarAlt, FaSignInAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SideBar = ({ isSidebarOpen, userEmail, showCompanies = false, showEvents = false }) => {
  return (
    <div className={`w-full bg-white lg:w-64 text-orange-500 fixed lg:sticky top-0 h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } z-40 ${!isSidebarOpen ? 'mt-16 lg:mt-0' : 'mt-2 lg:mt-0'}`}>
      <div className="p-4">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-black">SAEC Placements</h2>
          <div className={`flex items-center gap-2 ${isSidebarOpen ? 'block' : 'hidden lg:flex'}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
              {userEmail ? userEmail[0].toUpperCase() : ''}
            </div>
            <p className="text-sm text-gray-600">{userEmail}</p>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="flex items-center space-x-2 p-2 text-black hover:bg-orange-500 hover:text-white rounded transition-all duration-200 group">
                <FaHome className="text-orange-500 group-hover:text-white" />
                <span>Home</span>
              </Link>
            </li>
            {/* {showStudents && (
              <li>
                <Link to="/students" className="flex items-center space-x-2 p-2 text-black hover:bg-orange-500 hover:text-white rounded transition-all duration-200 group">
                  <FaUserGraduate className="text-orange-500 group-hover:text-white" />
                  <span>Students</span>
                </Link>
              </li>
            )} */}
            {showCompanies && (
              <li>
                <Link to="/companies" className="flex items-center space-x-2 p-2 text-black hover:bg-orange-500 hover:text-white rounded transition-all duration-200 group">
                  <FaBuilding className="text-orange-500 group-hover:text-white" />
                  <span>Companies</span>
                </Link>
              </li>
            )}
            {showEvents && (
              <li>
                <Link to="/events" className="flex items-center space-x-2 p-2 text-black hover:bg-orange-500 hover:text-white rounded transition-all duration-200 group">
                  <FaCalendarAlt className="text-orange-500 group-hover:text-white" />
                  <span>Events</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/auth/options" className="flex items-center space-x-2 p-2 text-black hover:bg-orange-500 hover:text-white rounded transition-all duration-200 group">
                <FaSignInAlt className="text-orange-500 group-hover:text-white" />
                <span>Login</span>
              </Link>            
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;