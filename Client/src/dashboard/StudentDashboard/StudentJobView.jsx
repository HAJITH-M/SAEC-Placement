import React, { useState, useEffect } from "react";
import {
  Building2, MapPin, Banknote, Calendar, Link, Navigation, ThumbsUp, ThumbsDown, Loader, X
} from "lucide-react";
import { deleteData, fetchData, postData } from "../../services/apiService";

const StudentJobView = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [endsOn, setEndsOn] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const fetchJobsAndStatus = async () => {
      try {
        setIsFetching(true);
        setLoadingStates({});

        const drivesResponse = await fetchData("/student/displaydrives");

        const drivesData = drivesResponse.data;
        if (!drivesData?.drives_list) {
          throw new Error("No drives data received");
        }

        const formattedJobs = drivesData.drives_list.map((drive) => ({
          title: drive.jobDescription || "Untitled Job",
          company: drive.companyName || "Unknown Company",
          location: drive.location || "Not specified",
          salary: drive.salary || "Not specified",
          endDate: drive.expiration || new Date().toISOString(),
          driveType: drive.driveType || "On-campus",
          registrationStatus: new Date(drive.expiration) > new Date() ? "Open" : "Closed",
          status: "Open",
          jobLink: drive.driveLink || "#",
          id: drive.id,
          department: drive.department || [],
        }));

        const initialLoadingStates = {};
        for (const job of formattedJobs) {
          initialLoadingStates[job.id] = true;
          const applied = await checkApplicationStatus(job.id);
          const isExpired = new Date(job.endDate) <= new Date();
          if (applied && isExpired) {
            job.status = "Registered and Closed";
          } else if (applied) {
            job.status = "Registered";
          } else if (isExpired) {
            job.status = "Closed";
          } else {
            job.status = "Open";
          }
          initialLoadingStates[job.id] = false;
        }

        setJobs(formattedJobs);
        setLoadingStates(initialLoadingStates);

        const endsOnData = {};
        formattedJobs.forEach((job) => {
          const endDate = new Date(job.endDate);
          const today = new Date();
          const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
          endsOnData[job.id] = `${daysLeft.toString().padStart(2, "0")} days left`;
        });
        setEndsOn(endsOnData);

      } catch (err) {
        addToast(err.message || "Failed to fetch jobs", "error");
      } finally {
        setIsFetching(false);
      }
    };

    fetchJobsAndStatus();
  }, []);

  const checkApplicationStatus = async (driveId) => {
    try {
      const response = await fetchData(`/student/check-application-status/${driveId}`);
      return response.data?.applied || false;
    } catch (err) {
      return false;
    }
  };

  const handleThumbsUp = async (index) => {
    const job = jobs[index];
    if (job.status === "Registered" || job.status === "Registered and Closed") {
      addToast("You have already registered for this drive", "error");
      return;
    }
    if (job.status === "Closed") {
      addToast("This job has expired and cannot be registered for", "error");
      return;
    }

    const confirmRegister = window.confirm(`Are you sure you want to register for "${job.title}" at ${job.company}?`);
    if (!confirmRegister) return;

    try {
      setLoadingStates((prev) => ({ ...prev, [job.id]: true }));
      const response = await postData("/student/applyfordrive", { id: job.id });
      const updatedJobs = [...jobs];
      const isExpired = new Date(job.endDate) <= new Date();
      updatedJobs[index].status = isExpired ? "Registered and Closed" : "Registered";
      setJobs(updatedJobs);
      addToast(response.data?.message || "Successfully registered for the drive", "success");
    } catch (err) {
      addToast(err.message || "Failed to register for the drive", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleThumbsDown = async (index) => {
    const job = jobs[index];
    const confirmDecline = window.confirm(
      `Are you sure you want to decline "${job.title}" at ${job.company}?`
    );
    if (!confirmDecline) return;
  
    try {
      setLoadingStates((prev) => ({ ...prev, [job.id]: true }));
      
      if (job.status === "Registered" || job.status === "Registered and Closed") {
        const response = await deleteData("/student/remove-application", {
          data: { id: job.id }
        });
  
        const data = await response.data;
        addToast(data.message || "Application removed successfully", "success");
      }
  
      const updatedJobs = [...jobs];
      const isExpired = new Date(job.endDate) <= new Date();
      updatedJobs[index].status = isExpired ? "Closed" : "Open";
      setJobs(updatedJobs);
    } catch (err) {
      addToast(err.message || "Failed to decline the drive", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const filteredJobs = filter === "all" 
    ? jobs 
    : jobs.filter((job) => job.status.toLowerCase().includes(filter.toLowerCase()));

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedJob(null);
    }
  };

  if (isFetching && !jobs.length) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center space-y-2">
          <Loader className="animate-spin w-15 h-15" />
          <span>Brewing Jobs</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 relative min-h-screen">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded shadow-lg text-white transition-all duration-300 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-6 justify-center sm:justify-start">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${filter === "all" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("registered")}
          className={`px-4 py-2 rounded ${filter === "registered" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
        >
          Registered
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 rounded ${filter === "open" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 rounded ${filter === "closed" ? "bg-orange-500 text-white" : "bg-gray-200"}`}
        >
          Closed
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <div
            key={job.id}
            className="bg-white flex flex-col justify-between rounded-lg shadow-md p-6 hover:shadow-lg hover:shadow-orange-200 transition-shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <div className="w-full sm:w-[80%]">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-3">{job.company}</h4>
                {job.company.length > 100 && (
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-orange-500 hover:text-orange-600 text-sm mt-1"
                  >
                    Read More
                  </button>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap mt-2 sm:mt-0 ${
                  job.status === "Registered"
                    ? "bg-green-100 text-green-600"
                    : job.status === "Closed"
                    ? "bg-red-100 text-red-600"
                    : job.status === "Registered and Closed"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {job.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Building2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <div>
                  <span className="line-clamp-2">{job.title}</span>
                  {job.title.length > 50 && (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-orange-500 cursor-pointer hover:text-orange-600 text-sm mt-1 block"
                    >
                      Read More
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Banknote size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{job.salary}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{endsOn[job.id] || "Calculating..."}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Navigation size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{job.driveType}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="truncate">Departments: {job.department.join(", ") || "N/A"}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <a
                href={job.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                  job.status === "Registered" || loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                onClick={(e) => {
                  if (job.status === "Registered" || loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed") {
                    e.preventDefault();
                  }
                }}
              >
                <Link size={16} />
                Apply Now
              </a>
              <div className="flex flex-col sm:flex-row justify-between gap-1.5">
                <button
                  onClick={() => handleThumbsUp(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    job.status === "Registered" || loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={job.status === "Registered" || loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed"}
                >
                  <ThumbsUp size={16} />
                  {loadingStates[job.id] && job.status !== "Registered" && job.status !== "Closed" && job.status !== "Registered and Closed" ? "Registering..." : "Register"}
                </button>
                <button
                  onClick={() => handleThumbsDown(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={loadingStates[job.id] || job.status === "Closed" || job.status === "Registered and Closed"}
                >
                  <ThumbsDown size={16} />
                  {loadingStates[job.id] && (job.status === "Registered" || job.status === "Registered and Closed") ? "Removing..." : "Decline"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Job Details */}
      {selectedJob && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Job Details</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-600 cursor-pointer hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Company</h3>
                <p className="text-gray-600 text-sm sm:text-base">{selectedJob.company}</p>
              </div>
              <div className="flex items-center text-gray-600">
                <Building2 size={18} className="mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{selectedJob.title}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{selectedJob.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Banknote size={18} className="mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{selectedJob.salary}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{endsOn[selectedJob.id]}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Navigation size={18} className="mr-2 text-orange-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{selectedJob.driveType}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-sm sm:text-base">Departments: </span>
                <span className="text-sm sm:text-base">{selectedJob.department.join(", ") || "N/A"}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-sm sm:text-base">Status: </span>
                <span className="text-sm sm:text-base">{selectedJob.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobView;