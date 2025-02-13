import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import StudentLogin from "../pages/LoginPage/StudentLogin/StudentLogin";
import StaffLogin from "../pages/LoginPage/StaffLogin/StaffLogin";
import Home from "../pages/HomePage/Home";
import SplashScreen from "../components/SplashScreen/SplashScreen";
import AuthOptionPage from "../pages/AuthOptionPage/AuthOptionPage";



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/auth/options" element={<AuthOptionPage/>} />
        <Route path="/auth/student" element={<StudentLogin/>} />
        <Route path="/auth/staff" element={<StaffLogin/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
