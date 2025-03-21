import React, { useState, useEffect } from "react";
import {
  Building2, MapPin, Banknote, Calendar, Link, Navigation, ThumbsUp, ThumbsDown, Loader
} from "lucide-react";

const StudentJobView = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [toasts, setToasts] = useState([]); // State for managing toasts
  const [endsOn, setEndsOn] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  // Function to add a toast
  const addToast = (message, type = "success") => {
    const id = Date.now(); // Unique ID for each toast
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const fetchJobsAndStatus = async () => {
      try {
        setIsFetching(true);
        setLoadingStates({});

        const drivesResponse = await fetch("http://localhost:9999/student/displaydrives", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!drivesResponse.ok) {
          throw new Error("Failed to fetch drives");
        }

        const drivesData = await drivesResponse.json();
        const formattedJobs = drivesData.drives_list.map((drive) => ({
          title: drive.jobDescription || "Untitled Job",
          company: drive.companyName,
          location: "Not specified",
          salary: "Not specified",
          endDate: drive.expiration,
          driveType: "On-campus",
          registrationStatus: new Date(drive.expiration) > new Date() ? "Open" : "Closed",
          status: "Open",
          jobLink: drive.driveLink,
          id: drive.id,
          department: drive.department || [],
        }));

        const initialLoadingStates = {};
        for (const job of formattedJobs) {
          initialLoadingStates[job.id] = true;
          const applied = await checkApplicationStatus(job.id);
          job.status = applied ? "Registered" : "Open";
          initialLoadingStates[job.id] = false;
        }

        setJobs(formattedJobs);
        setLoadingStates(initialLoadingStates);
      } catch (err) {
        addToast(err.message || "Failed to fetch jobs", "error");
      } finally {
        setIsFetching(false);
      }
    };

    fetchJobsAndStatus();
  }, []);

  useEffect(() => {
    for (const job of jobs) {
      const endDate = new Date(job.endDate);
      const today = new Date();
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      setEndsOn((prevEndsOn) => [...prevEndsOn, `${daysLeft.toString().padStart(2, "0")} days left`]);
    }
  }, [jobs]);

  const checkApplicationStatus = async (driveId) => {
    try {
      const response = await fetch(`http://localhost:9999/student/check-application-status/${driveId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.applied;
    } catch (err) {
      console.error("Error checking application status:", err);
      return false;
    }
  };

  const handleThumbsUp = async (index) => {
    const job = jobs[index];
    if (job.status === "Registered") {
      addToast("You have already registered for this drive", "error");
      return;
    }

    const confirmRegister = window.confirm(`Are you sure you want to register for "${job.title}" at ${job.company}?`);
    if (!confirmRegister) return;

    try {
      setLoadingStates((prev) => ({ ...prev, [job.id]: true }));

      const response = await fetch("http://localhost:9999/student/applyfordrive", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to register for the drive");
      }

      const data = await response.json();
      const updatedJobs = [...jobs];
      updatedJobs[index].status = "Registered";
      setJobs(updatedJobs);
      addToast(data.message || "Successfully registered for the drive", "success");
    } catch (err) {
      console.error("Error registering for drive:", err);
      addToast(err.message || "Failed to register for the drive", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleThumbsDown = async (index) => {
    const job = jobs[index];
    const confirmDecline = window.confirm(
      `Are you sure you want to decline "${job.title}" at ${job.company}? This will remove your registration if you were previously registered.`
    );
    if (!confirmDecline) return;

    try {
      setLoadingStates((prev) => ({ ...prev, [job.id]: true }));

      if (job.status === "Registered") {
        const response = await fetch("http://localhost:9999/student/remove-application", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: job.id }),
        });

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Failed to remove application: ${responseText}`);
        }

        const data = await response.json();
        addToast(data.message || "Application removed successfully", "success");
      } else {
        addToast("Drive declined successfully", "success");
      }

      const updatedJobs = [...jobs];
      updatedJobs[index].status = "Open";
      setJobs(updatedJobs);
    } catch (err) {
      console.error("Error removing application:", err);
      addToast(err.message || "Failed to decline the drive", "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const filteredJobs =
    filter === "all"
      ? jobs
      : jobs.filter((job) => job.status.toLowerCase() === filter.toLowerCase());

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
    <div className="p-8 relative">
      {/* Toast Container */}
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

      <div className="flex gap-4 mb-6">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <div
            key={job.id}
            className="bg-white flex flex-col justify-between rounded-lg shadow-md p-6 hover:shadow-lg hover:shadow-orange-200 transition-shadow overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 break-words">{job.title}</h4>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    job.status === "Registered"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Building2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">{job.company}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
                  <span className="truncate">{endsOn[index]}</span>
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
                  job.status === "Registered" || loadingStates[job.id]
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                onClick={(e) => {
                  if (job.status === "Registered" || loadingStates[job.id]) {
                    e.preventDefault();
                  }
                }}
              >
                <Link size={16} />
                Apply Now
              </a>
              <div className="flex justify-between gap-1.5">
                <button
                  onClick={() => handleThumbsUp(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    job.status === "Registered" || loadingStates[job.id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={job.status === "Registered" || loadingStates[job.id]}
                >
                  <ThumbsUp size={16} />
                  {loadingStates[job.id] && job.status !== "Registered" ? "Registering..." : "Register"}
                </button>
                <button
                  onClick={() => handleThumbsDown(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    loadingStates[job.id] ? "bg-gray-400 cursor-not-allowed" : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={loadingStates[job.id]}
                >
                  <ThumbsDown size={16} />
                  {loadingStates[job.id] && job.status === "Registered" ? "Removing..." : "Decline"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentJobView;