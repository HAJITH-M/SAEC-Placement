import React from 'react';  // removed useState since it's not used here
import PlacementStats from '../../components/PlacementStats/PlacementStatsView';
import RecentPlacements from '../../components/RecentPlacements/RecentPlacementsView';
import NavBar from '../../components/NavBar/NavBarView';
import SideBar from '../../components/SideBar/SideBarView';
import HomeVM from './HomeVM';

const HomeView = () => {
  const viewModel = HomeVM();  // renamed for clarity

  return (
    <div className="flex flex-col lg:flex-row min-h-screen ">
      <NavBar isSidebarOpen={viewModel.isSidebarOpen} toggleSidebar={viewModel.toggleSidebar} />
      <SideBar isSidebarOpen={viewModel.isSidebarOpen} userEmail={"Demo@gmail.com"} showStudents={true}  />

      <div className={`w-full transition-margin duration-300 ease-in-out ${viewModel.isSidebarOpen ? 'lg:ml-0' : 'ml-0'} flex-1 mt-16 lg:mt-0`}>
        <div className="text-orange-500 py-8 lg:py-12 px-4 shadow-xl bg-orange-500">
          <div className="container mx-auto text-center bg-orange-500">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Welcome to SAEC Placement Portal</h1>
            <p className="text-xl text-gray-200 mb-6">Shaping Careers, Building Futures</p>
          </div>
        </div>
        
        <PlacementStats />
        <RecentPlacements />
      </div>
    </div>
  );
};

export default HomeView;