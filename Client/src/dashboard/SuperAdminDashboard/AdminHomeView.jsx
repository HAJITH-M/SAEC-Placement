import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, BookOpen, Briefcase, UserCheck } from "lucide-react";
import { fetchData } from "../../services/apiService";

const AdminHomeViewDashboard = () => {
  const [staffCount, setStaffCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [totalStudentRegistrations, setTotalStudentRegistrations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch staff and student counts from /superadmin
      const superAdminResponse = await fetchData("/superadmin", {
        withCredentials: true,
      });
      console.log("SuperAdmin Response:", superAdminResponse.data); // Debug log
      if (superAdminResponse.data.success) {
        setStaffCount(superAdminResponse.data.staff?.length || 0);
        setStudentCount(superAdminResponse.data.students?.length || 0);
      } else {
        throw new Error("Failed to fetch superadmin data");
      }

      // Fetch job and registration counts from /jobs-with-students
      const jobsResponse = await axios.get("http://localhost:9999/superadmin/jobs-with-students", {
        withCredentials: true,
      });
      console.log("Jobs Response:", jobsResponse.data); // Debug log
      if (jobsResponse.data.success) {
        const jobs = Array.isArray(jobsResponse.data.jobs) ? jobsResponse.data.jobs : [];
        setJobCount(jobs.length);
        const totalRegistrations = jobs.reduce(
          (acc, job) => acc + (job.students?.length || 0),
          0
        );
        setTotalStudentRegistrations(totalRegistrations);
      } else {
        throw new Error("Failed to fetch jobs data");
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Large Box: Total Staff */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Staff</h2>
            <p className="text-3xl sm:text-4xl font-bold text-orange-500 mt-2">
              {staffCount}
            </p>
          </div>
          <Users size={48} className="text-orange-500" />
        </div>

        {/* Medium Box: Total Students */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Students</h2>
            <p className="text-2xl sm:text-3xl font-bold text-blue-500 mt-2">
              {studentCount}
            </p>
          </div>
          <BookOpen size={36} className="text-blue-500" />
        </div>

        {/* Medium Box: Total Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Jobs</h2>
            <p className="text-2xl sm:text-3xl font-bold text-green-500 mt-2">
              {jobCount}
            </p>
          </div>
          <Briefcase size={36} className="text-green-500" />
        </div>

        {/* Small Box: Total Student Registrations */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-md font-semibold text-gray-700">Registrations</h2>
            <p className="text-xl sm:text-2xl font-bold text-purple-500 mt-2">
              {totalStudentRegistrations}
            </p>
          </div>
          <UserCheck size={32} className="text-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default AdminHomeViewDashboard;