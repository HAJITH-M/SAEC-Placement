import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from "../pages/Login/Login";
import StudentLogin from "../pages/Login/StudentLogin/StudentLogin";
import StaffLogin from "../pages/Login/StaffLogin/StaffLogin";


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/studentlogin" element={<StudentLogin/>} />
        <Route path="/stafflogin" element={<StaffLogin/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
