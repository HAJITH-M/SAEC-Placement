import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie
import StudentLogin from '../pages/LoginPage/StudentLogin/StudentLogin';
import StaffLogin from '../pages/LoginPage/StaffLogin/StaffLogin';
import AuthOptionPage from '../pages/AuthOptionPage/AuthOptionPage';
import SuperAdminLogin from '../pages/LoginPage/SuperAdminLogin/SuperAdminLogin';
import SplashScreenView from '../components/SplashScreen/SplashScreenView';
import SuperAdminRegister from '../pages/RegisterPage/SuperAdminRegister';
import HomeView from '../pages/HomePage/HomeView';
import StudentDashboardView from '../dashboard/StudentDashboard/StudentDashboardView';
import SuperAdminDashboardView from '../dashboard/SuperAdminDashboard/SuperAdminDashboardView';
import OAuthSuccess from '../pages/LoginPage/OAuth/OAuthSuccess';
import StudentForgotPassword from '../pages/LoginPage/StudentLogin/StudentForgotPassword';
import StaffForgotPassword from '../pages/LoginPage/StaffLogin/StaffForgotPassword';
import StudentResetPassword from '../pages/LoginPage/StudentLogin/StudentResetPassword';
import StaffResetPassword from '../pages/LoginPage/StaffLogin/StaffResetPassword';
import ProtectedRoute from '../pages/LoginPage/OAuth/ProtectedRoute';
import StaffDashboardView from '../dashboard/StaffDashboard/StaffDashboardView';
import StaffEventAdd from '../dashboard/StaffDashboard/StaffEventAdd';
import AdminAddEvents from '../dashboard/SuperAdminDashboard/AdminAddEvents';

// SplashScreen with Cookie Check
const SplashScreenWithRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const staffSession = Cookies.get('staff_session');
    const studentSession = Cookies.get('student_session');
    const superAdminSession = Cookies.get('admin_session')||Cookies.get('oauth_session');

    if (staffSession) {
      navigate('/dashboard/staff');
    } else if (studentSession) {
      navigate('/dashboard/student');
    } else if (superAdminSession) {
      navigate('/dashboard/superadmin');
    } else {
      navigate('/'); // Default redirect if no session
    }
  }, [navigate]);

  return <SplashScreenView />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreenWithRedirect />} />
        <Route path="/home" element={<HomeView />} />
        <Route path="/auth/options" element={<AuthOptionPage />} />
        <Route path="/auth/student" element={<StudentLogin />} />
        <Route path="/auth/staff" element={<StaffLogin />} />
        <Route path="/auth/superadmin" element={<SuperAdminLogin />} />
        <Route path="/auth/superadmin/register" element={<SuperAdminRegister />} />
        
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/dashboard/student" element={<StudentDashboardView />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="staff" />}>
          <Route path="/dashboard/staff" element={<StaffDashboardView />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="super_admin" />}>
          <Route path="/dashboard/superadmin" element={<SuperAdminDashboardView />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="staff" />}>
          <Route path="/addevents/staff" element={<StaffEventAdd />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRole="super_admin" />}>
          <Route path="/addevents/superadmin" element={<AdminAddEvents />} />
        </Route>

        <Route path="/auth/student/forgot-password" element={<StudentForgotPassword />} />
        <Route path="/auth/staff/forgot-password" element={<StaffForgotPassword />} />
        <Route path="/auth/student/reset-password" element={<StudentResetPassword />} />
        <Route path="/auth/staff/reset-password" element={<StaffResetPassword />} />
        <Route path="/auth/success" element={<OAuthSuccess />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;