import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import StudentLogin from "../pages/LoginPage/StudentLogin/StudentLogin";
import StaffLogin from "../pages/LoginPage/StaffLogin/StaffLogin";
import Home from "../pages/HomePage/Home";
import AuthOptionPage from "../pages/AuthOptionPage/AuthOptionPage";
import SuperAdminLogin from "../pages/LoginPage/SuperAdminLogin/SuperAdminLogin";
import SplashScreenView from "../components/SplashScreen/SplashScreenView";



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreenView/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/auth/options" element={<AuthOptionPage/>} />
        <Route path="/auth/student" element={<StudentLogin/>} />
        <Route path="/auth/staff" element={<StaffLogin/>} />
        <Route path="/auth/superadmin" element={<SuperAdminLogin/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
