import React, { useEffect, useState } from 'react';
import PlacementStats from '../../components/PlacementStats/PlacementStatsView';
import RecentPlacements from '../../components/RecentPlacements/RecentPlacementsView';
import NavBar from '../../components/NavBar/NavBarView';
import SideBar from '../../components/SideBar/SideBarView';
import HomeVM from './HomeVM';
import PlacedStudents from '../../components/PlacedStudents/PlacedStudents';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchData } from '../../services/apiService';

const HomeView = () => {
  const viewModel = HomeVM();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Initial session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetchData('/check-session', { withCredentials: true });
        const { role } = response.data;
        setHasSession(true);
        if (role === 'admin') {
          navigate('/dashboard/superadmin', { replace: true });
        } else if (role === 'student') {
          navigate('/dashboard/student', { replace: true });
        } else if (role === 'staff') {
          navigate('/dashboard/staff', { replace: true });
        }
      } catch (err) {
        if (err.response?.status !== 401) {
        }
        setHasSession(false); // No session or unauthorized, stay on /home
      } finally {
        setIsChecking(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Continuous guard only if no session initially detected
  useEffect(() => {
    if (hasSession) return; // Skip if session was found initially

    const interval = setInterval(async () => {
      try {
        const response = await fetchData('/check-session', { withCredentials: true });
        const { role } = response.data;
        setHasSession(true);
        if (role === 'admin') {
          navigate('/dashboard/superadmin', { replace: true });
        } else if (role === 'student') {
          navigate('/dashboard/student', { replace: true });
        } else if (role === 'staff') {
          navigate('/dashboard/staff', { replace: true });
        }
      } catch (err) {
        if (err.response?.status !== 401) {
        }
        // No session or unauthorized, stay on /home silently
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [navigate, hasSession]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <NavBar isSidebarOpen={viewModel.isSidebarOpen} toggleSidebar={viewModel.toggleSidebar} />
      <SideBar isSidebarOpen={viewModel.isSidebarOpen}  showStudents={true} />

      <div className={`w-full transition-margin duration-300 ease-in-out ${viewModel.isSidebarOpen ? 'lg:ml-0' : 'ml-0'} flex-1 mt-16 lg:mt-0`}>
        <div className="text-orange-500 py-8 lg:py-12 px-4 shadow-xl bg-orange-500">
          <div className="container mx-auto text-center bg-orange-500">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-white">Welcome to SAEC Placement Portal</h1>
            <p className="text-xl text-gray-200 mb-6">Shaping Careers, Building Futures</p>
          </div>
        </div>

        <PlacedStudents />
        <PlacementStats />
        <RecentPlacements />
      </div>
    </div>
  );
};

export default HomeView;