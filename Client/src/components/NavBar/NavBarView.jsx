import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <nav className="bg-white text-white p-4 fixed w-full z-50 lg:hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-black">SAEC Placements</h2>
        <button
          className="p-2 rounded-md text-purple-800"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;