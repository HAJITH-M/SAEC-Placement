import React, { useState, useEffect } from "react";
import {
  Building2, MapPin, Banknote, Calendar, Link, CheckCircle2, Navigation, ThumbsUp, ThumbsDown,
} from "lucide-react";

const StudentJobView = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchJobsAndStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Fetch drives
        const drivesResponse = await fetch("http://localhost:9999/student/displaydrives", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!drivesResponse.ok) {
          throw new Error("Failed to fetch drives");
        }

        const drivesData = await drivesResponse.json();
        console.log("Raw drives data:", drivesData);

        const formattedJobs = drivesData.drives_list.map((drive) => ({
          title: drive.jobDescription || "Untitled Job",
          company: drive.companyName,
          location: "Not specified",
          salary: "Not specified",
          endDate: drive.expiration,
          driveType: "On-campus",
          registrationStatus: new Date(drive.expiration) > new Date() ? "Open" : "Closed",
          status: "Open", // Default status, will be updated
          jobLink: drive.driveLink,
          id: drive.id,
          department: drive.department || [],
        }));

        // Check application status for each job
        for (const job of formattedJobs) {
          const applied = await checkApplicationStatus(job.id);
          console.log(`Drive ${job.id} - Applied: ${applied}`);
          job.status = applied ? "Registered" : "Open"; // Set based on actual status
        }

        console.log("Final jobs state:", formattedJobs);
        setJobs(formattedJobs);
      } catch (err) {
        setError(err.message || "Failed to fetch jobs");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndStatus();
  }, []);

  // Corrected checkApplicationStatus using the dedicated endpoint
  const checkApplicationStatus = async (driveId) => {
    try {
      const response = await fetch(`http://localhost:9999/student/check-application-status/${driveId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.applied; // Returns true if applied, false if not
    } catch (err) {
      console.error("Error checking application status:", err);
      return false;
    }
  };

  const handleThumbsUp = async (index) => {
    const job = jobs[index];
    if (job.status === "Registered") {
      setError("You have already registered for this drive");
      return;
    }

    const confirmRegister = window.confirm(`Are you sure you want to register for "${job.title}" at ${job.company}?`);
    if (!confirmRegister) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

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
      setSuccess(data.message || "Successfully registered for the drive");
    } catch (err) {
      console.error("Error registering for drive:", err);
      setError(err.message || "Failed to register for the drive");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbsDown = async (index) => {
    const job = jobs[index];
    const confirmDecline = window.confirm(
      `Are you sure you want to decline "${job.title}" at ${job.company}? This will remove your registration if you were previously registered.`
    );
    if (!confirmDecline) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

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
        setSuccess(data.message || "Application removed successfully");
      } else {
        setSuccess("Drive declined successfully");
      }

      const updatedJobs = [...jobs];
      updatedJobs[index].status = "Open"; // After removal, it’s "Open" again
      setJobs(updatedJobs);
    } catch (err) {
      console.error("Error removing application:", err);
      setError(err.message || "Failed to decline the drive");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs =
    filter === "all"
      ? jobs
      : jobs.filter((job) => job.status.toLowerCase() === filter.toLowerCase());

  if (loading && !jobs.length) {
    return <div className="p-6">Loading jobs...</div>;
  }

  if (error && !jobs.length) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-1">
      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">{success}</div>
      )}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
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
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 break-words">{job.title}</h3>
                <div className="flex items-center mt-2 text-gray-600">
                  <Building2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{job.company}</span>
                </div>
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
                <MapPin size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Banknote size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">{job.salary}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Ends on: {job.endDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Navigation size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">{job.driveType}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle2 size={18} className="mr-2 flex-shrink-0 text-orange-500" />
                <span className="truncate">Registration Status: {job.registrationStatus}</span>
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
                className="flex items-center justify-center gap-1.5 bg-orange-500 text-white py-1.5 px-3 rounded hover:bg-orange-600 transition-colors text-sm"
              >
                <Link size={16} />
                Apply Now
              </a>
              <div className="flex justify-between gap-1.5">
                <button
                  onClick={() => handleThumbsUp(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    job.status === "Registered" || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={job.status === "Registered" || loading}
                >
                  <ThumbsUp size={16} />
                  {loading && job.status !== "Registered" ? "Registering..." : "Register"}
                </button>
                <button
                  onClick={() => handleThumbsDown(index)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-sm text-white transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-400 hover:bg-orange-500"
                  }`}
                  disabled={loading}
                >
                  <ThumbsDown size={16} />
                  {loading && job.status === "Registered" ? "Removing..." : "Decline"}
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