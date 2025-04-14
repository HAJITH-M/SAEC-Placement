import React from 'react';
import { FaGraduationCap, FaBriefcase, FaChartLine, FaHandshake } from 'react-icons/fa';

const PlacementStats = () => {
  return (
    <div className="container bg-slate-50 mx-auto py-10 lg:py-16 px-4">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-black">Placement Highlights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg text-center border border-gray-200 hover:border-orange-500 transition-all duration-200">
          <FaGraduationCap className="text-4xl lg:text-5xl text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold mb-2">500+</h3>
          <p className="text-black">Students Placed</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg text-center border border-gray-200 hover:border-orange-500 transition-all duration-200">
          <FaBriefcase className="text-4xl lg:text-5xl text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold mb-2">100+</h3>
          <p className="text-black">Partner Companies</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg text-center border border-gray-200 hover:border-orange-500 transition-all duration-200">
          <FaChartLine className="text-4xl lg:text-5xl text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold mb-2">12 LPA</h3>
          <p className="text-black">Highest Package</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg text-center border border-gray-200 hover:border-orange-500 transition-all duration-200">
          <FaHandshake className="text-4xl lg:text-5xl text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg lg:text-xl font-semibold mb-2">90%</h3>
          <p className="text-black">Placement Rate</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementStats;