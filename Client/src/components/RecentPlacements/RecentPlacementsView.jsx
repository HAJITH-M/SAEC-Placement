import React, { useEffect, useState } from 'react';
import { fetchData } from '../../services/apiService';

const RecentPlacements = () => {
  const [placements, setPlacements] = useState([]);

  const fetchPlacementDetails = async () => {
    try {
      const response = await fetchData('/get-jobs', { withCredentials: true });
      setPlacements(response.data);
    } catch (error) {
      console.error('Failed to fetch placement details:', error);
    }
  };

  useEffect(() => {
    fetchPlacementDetails();
  }, []);

  // Split placements into two halves
  const midPoint = Math.ceil(placements.length / 2);
  const leftToRightPlacements = placements.slice(0, midPoint);
  const rightToLeftPlacements = placements.slice(midPoint);

  return (
    <div className="bg-slate-50 py-10 lg:py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-black">Recent Placements</h2>
        
        {placements.length > 0 ? (
          <div className="space-y-8">
            {/* Left to Right Scrolling Section */}
            <div className="overflow-hidden">
              <div className="flex animate-scroll-left-to-right whitespace-nowrap">
                {leftToRightPlacements.map((placement, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200 mx-2 flex-shrink-0 w-72"
                  >
                    <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">
                      {placement.companyName || 'Unknown Company'}
                    </h3>
                    <p className="text-black mb-4">
                      {placement.role || 'Role Not Specified'}
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {placement.lpa ? `${placement.lpa} LPA` : 'Salary Not Specified'}
                    </p>
                  </div>
                ))}
                {/* Duplicate for seamless looping */}
                {leftToRightPlacements.map((placement, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200 mx-2 flex-shrink-0 w-72"
                  >
                    <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">
                      {placement.companyName || 'Unknown Company'}
                    </h3>
                    <p className="text-black mb-4">
                      {placement.role || 'Role Not Specified'}
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {placement.lpa ? `${placement.lpa} LPA` : 'Salary Not Specified'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right to Left Scrolling Section */}
            <div className="overflow-hidden">
              <div className="flex animate-scroll-right-to-left whitespace-nowrap">
                {rightToLeftPlacements.map((placement, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200 mx-2 flex-shrink-0 w-72"
                  >
                    <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">
                      {placement.companyName || 'Unknown Company'}
                    </h3>
                    <p className="text-black mb-4">
                      {placement.role || 'Role Not Specified'}
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {placement.lpa ? `${placement.lpa} LPA` : 'Salary Not Specified'}
                    </p>
                  </div>
                ))}
                {/* Duplicate for seamless looping */}
                {rightToLeftPlacements.map((placement, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="bg-white p-4 lg:p-6 rounded-lg shadow-lg border border-gray-200 hover:border-orange-500 transition-all duration-200 mx-2 flex-shrink-0 w-72"
                  >
                    <h3 className="font-semibold text-lg lg:text-xl mb-2 text-black">
                      {placement.companyName || 'Unknown Company'}
                    </h3>
                    <p className="text-black mb-4">
                      {placement.role || 'Role Not Specified'}
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {placement.lpa ? `${placement.lpa} LPA` : 'Salary Not Specified'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">No data found</p>
          </div>
        )}
      </div>

      {/* Custom CSS for scrolling animations */}
      <style jsx>{`
        @keyframes scroll-left-to-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right-to-left {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left-to-right {
          animation: scroll-left-to-right 20s linear infinite;
        }

        .animate-scroll-right-to-left {
          animation: scroll-right-to-left 20s linear infinite;
        }

        /* Pause animation on hover */
        .animate-scroll-left-to-right:hover,
        .animate-scroll-right-to-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default RecentPlacements;