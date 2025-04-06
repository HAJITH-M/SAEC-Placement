import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, BookOpen, Briefcase, UserCheck, CheckCircle, Clock, Mail, Loader2 } from "lucide-react";
import { fetchData } from "../../services/apiService";
import PlacedStudents from "../../components/PlacedStudents/PlacedStudents";

const AdminHomeViewDashboard = () => {
  const [staffCount, setStaffCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [totalStudentRegistrations, setTotalStudentRegistrations] = useState(0);
  const [placedStudentCount, setPlacedStudentCount] = useState(0);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [expiredJobCount, setExpiredJobCount] = useState(0);
  const [notificationEmailCount, setNotificationEmailCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch staff, student counts, and placed students from /superadmin
      const superAdminResponse = await fetchData("/superadmin", {
        withCredentials: true,
      });
      console.log("SuperAdmin Response:", superAdminResponse.data);
      if (superAdminResponse.data.success) {
        setStaffCount(superAdminResponse.data.staff?.length || 0);
        setStudentCount(superAdminResponse.data.students?.length || 0);
        const placedCount = superAdminResponse.data.students?.filter(
          (student) => student.placedStatus === 'yes'
        ).length || 0;
        setPlacedStudentCount(placedCount);
      } else {
        throw new Error("Failed to fetch superadmin data");
      }

      // Fetch job counts and registrations from /jobs-with-students
      const jobsResponse = await fetchData("/superadmin/jobs-with-students", {
        withCredentials: true,
      });
      console.log("Jobs Response:", jobsResponse.data);
      if (jobsResponse.data.success) {
        const jobs = Array.isArray(jobsResponse.data.jobs) ? jobsResponse.data.jobs : [];
        setJobCount(jobs.length);
        const totalRegistrations = jobs.reduce(
          (acc, job) => acc + (job.students?.length || 0),
          0
        );
        setTotalStudentRegistrations(totalRegistrations);

        const currentDate = new Date();
        const activeJobs = jobs.filter((job) => new Date(job.expiration) > currentDate).length;
        const expiredJobs = jobs.filter((job) => new Date(job.expiration) <= currentDate).length;
        setActiveJobCount(activeJobs);
        setExpiredJobCount(expiredJobs);
      } else {
        throw new Error("Failed to fetch jobs data");
      }

      // Fetch notification email count from /getfeedgroupmail
      const emailResponse = await fetchData("/superadmin/getfeedgroupmail", {
        withCredentials: true,
      });
      console.log("Email Response:", emailResponse.data);
      setNotificationEmailCount(emailResponse.data.groupMailList?.length || 0);
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
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 ">
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

        {/* Small Box: Placed Students */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-md font-semibold text-gray-700">Placed Students</h2>
            <p className="text-xl sm:text-2xl font-bold text-teal-500 mt-2">
              {placedStudentCount}
            </p>
          </div>
          <CheckCircle size={32} className="text-teal-500" />
        </div>

        {/* Small Box: Active Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-md font-semibold text-gray-700">Active Jobs</h2>
            <p className="text-xl sm:text-2xl font-bold text-indigo-500 mt-2">
              {activeJobCount}
            </p>
          </div>
          <Clock size={32} className="text-indigo-500" />
        </div>

        {/* Small Box: Expired Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-md font-semibold text-gray-700">Expired Jobs</h2>
            <p className="text-xl sm:text-2xl font-bold text-red-500 mt-2">
              {expiredJobCount}
            </p>
          </div>
          <Clock size={32} className="text-red-500" />
        </div>

        {/* Small Box: Notification Emails */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div>
            <h2 className="text-md font-semibold text-gray-700">Notification Emails</h2>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500 mt-2">
              {notificationEmailCount}
            </p>
          </div>
          <Mail size={32} className="text-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export default AdminHomeViewDashboard;