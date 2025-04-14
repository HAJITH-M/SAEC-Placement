import PlacedStudents from "../../components/PlacedStudents/PlacedStudents";
import PlacementInfo from "../../components/PlacementInfo/PlacementInfo";
import PlacementStats from "../../components/PlacementStats/PlacementStatsView";
import RecentPlacements from "../../components/RecentPlacements/RecentPlacementsView";
import HomeVM from "../../pages/HomePage/HomeVM";

const StudentHomeComponent = () => {
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
          <PlacementInfo />
          <RecentPlacements/>
          <PlacementStats />
  
        </div>
      </>
    )
  }
  
export default StudentHomeComponent;