import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import StudentLogin from '../pages/LoginPage/StudentLogin/StudentLogin';
import StaffLogin from '../pages/LoginPage/StaffLogin/StaffLogin';
import AuthOptionPage from '../pages/AuthOptionPage/AuthOptionPage';
import SuperAdminLogin from '../pages/LoginPage/SuperAdminLogin/SuperAdminLogin';
import SplashScreenView from '../components/SplashScreen/SplashScreenView';
import SuperAdminRegister from '../pages/RegisterPage/SuperAdminRegister';
import HomeView from '../pages/HomePage/HomeView';
import OAuthSuccess from '../pages/LoginPage/OAuth/OAuthSuccess';
import StudentForgotPassword from '../pages/LoginPage/StudentLogin/StudentForgotPassword';
import StaffForgotPassword from '../pages/LoginPage/StaffLogin/StaffForgotPassword';
import StudentResetPassword from '../pages/LoginPage/StudentLogin/StudentResetPassword';
import StaffResetPassword from '../pages/LoginPage/StaffLogin/StaffResetPassword';
import ProtectedRoute from '../pages/LoginPage/OAuth/ProtectedRoute';
import StudentPage from '../pages/StudentPage/StudentPage';
import StaffPage from '../pages/StaffPage/StaffPage';
import SuperAdminPage from '../pages/SuperAdminPage/SuperAdminPage';
import SplashScreenWithRedirect from '../components/SplashScreenWithRedirect/SplashScreenWithRedirect';



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
        <Route path="/auth/success" element={<OAuthSuccess />} />

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/dashboard/student" element={<StudentPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="staff" />}>
          <Route path="/dashboard/staff" element={<StaffPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="super_admin" />}>
          <Route path="/dashboard/superadmin" element={<SuperAdminPage />} />
        </Route>

        <Route path="/auth/student/forgot-password" element={<StudentForgotPassword />} />
        <Route path="/auth/staff/forgot-password" element={<StaffForgotPassword />} />
        <Route path="/auth/student/reset-password" element={<StudentResetPassword />} />
        <Route path="/auth/staff/reset-password" element={<StaffResetPassword />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;