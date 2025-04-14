import React from "react";
import PlacedStudents from "../../components/PlacedStudents/PlacedStudents";
import RecentPlacements from "../../components/RecentPlacements/RecentPlacementsView";
import PlacementStats from "../../components/PlacementStats/PlacementStatsView";
import PlacementInfo from "../../components/PlacementInfo/PlacementInfo";


const StaffHomeView = () => {
  return (
    <div className="w-full">
      <div className="text-orange-500 py-4 sm:py-6 md:py-8 lg:py-12 px-2 sm:px-3 md:px-4 shadow-xl bg-orange-500">
        <div className="container mx-auto text-center bg-orange-500 max-w-7xl px-2 sm:px-4 lg:px-8">
          <h1 className="text-xl sm:text-xl md:text-3xlxl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">
            Welcome to SAEC Placement Portal
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-3 sm:mb-4 md:mb-6">
            Shaping Careers, Building Futures
          </p>
        </div>
      </div>
      <PlacedStudents />
      <PlacementInfo />

      <RecentPlacements />

      <PlacementStats />
    </div>
  );
};

export default StaffHomeView;
