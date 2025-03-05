import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import StudentLogin from "../pages/LoginPage/StudentLogin/StudentLogin";
import StaffLogin from "../pages/LoginPage/StaffLogin/StaffLogin";
import AuthOptionPage from "../pages/AuthOptionPage/AuthOptionPage";
import SuperAdminLogin from "../pages/LoginPage/SuperAdminLogin/SuperAdminLogin";
import SplashScreenView from "../components/SplashScreen/SplashScreenView";
import SuperAdminRegister from "../pages/RegisterPage/SuperAdminRegister";
import HomeView from "../pages/HomePage/HomeView";
import StudentDashboardView from "../dashboard/StudentDashboard/StudentDashboardView";
import SuperAdminDashboardView from "../dashboard/SuperAdminDashboard/SuperAdminDashboardView";
import OAuthSuccess from "../pages/LoginPage/OAuth/OAuthSuccess";
import ProtectedRoute from "../pages/LoginPage/OAuth/ProtectedRoute";
import StaffDashboardView from "../dashboard/StaffDashboard/StaffDashboardView";



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreenView/>} />
        <Route path="/home" element={<HomeView/>} />
        <Route path="/auth/options" element={<AuthOptionPage/>} />
        <Route path="/auth/student" element={<StudentLogin/>} />
        <Route path="/auth/staff" element={<StaffLogin/>} />
        <Route path="/auth/superadmin" element={<SuperAdminLogin/>} />
        <Route path="/auth/superadmin/register" element={<SuperAdminRegister/>} />
        <Route path="/dashboard/student" element={<StudentDashboardView/>} />
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/superadmin" element={<SuperAdminDashboardView />} />
        </Route>        <Route path="/ssss" element={<Ssss/>} /> */}

    <Route element={<ProtectedRoute allowedRole="super_admin" />}>
      <Route path="/dashboard/superadmin" element={<SuperAdminDashboardView />} />
    </Route>


    <Route element={<ProtectedRoute allowedRole="student" />}>
      <Route path="/dashboard/student" element={<StudentDashboardView />} />
    </Route>


    <Route element={<ProtectedRoute allowedRole="staff" />}>
      <Route path="/dashboard/staff" element={<StaffDashboardView />} />
    </Route>



        <Route path="/auth/success" element={<OAuthSuccess />} />

      </Routes>
    </Router>
  );
};

export default AppRouter;
