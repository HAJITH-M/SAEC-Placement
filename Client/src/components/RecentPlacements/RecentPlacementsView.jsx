import React from 'react';

const RecentPlacements = () => {
  return (
    <div className="bg-white py-10 lg:py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-black">Recent Placements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200">
            <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">TCS</h3>
            <p className="text-black mb-4">Software Engineer</p>
            <p className="text-orange-500 font-semibold">4.5 LPA</p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200">
            <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">Infosys</h3>
            <p className="text-black mb-4">Systems Engineer</p>
            <p className="text-orange-500 font-semibold">3.6 LPA</p>
          </div>
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200">
            <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">Wipro</h3>
            <p className="text-black mb-4">Project Engineer</p>
            <p className="text-orange-500 font-semibold">3.5 LPA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPlacements;