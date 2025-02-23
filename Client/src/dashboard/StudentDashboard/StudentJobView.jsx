import React, { useState } from "react";
import {
  Building2, MapPin, Banknote, Calendar, Link, CheckCircle2, Navigation, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { jobData } from "./JobView";

const StudentJobView = () => {
  const [jobs, setJobs] = useState(jobData);
  const [filter, setFilter] = useState("all");

  const handleThumbsUp = (index) => {
    const updatedJobs = [...jobs];
    updatedJobs[index].status = "Registered";
    setJobs(updatedJobs);
  };

  const handleThumbsDown = (index) => {
    const updatedJobs = [...jobs];
    updatedJobs[index].status = "Declined";
    setJobs(updatedJobs);
  };

  const filteredJobs =
    filter === "all"
      ? jobs
      : jobs.filter((job) => job.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="p-1">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("registered")}
          className={`px-4 py-2 rounded ${
            filter === "registered" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Registered
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 rounded ${
            filter === "open" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("declined")}
          className={`px-4 py-2 rounded ${
            filter === "declined" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Declined
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 break-words">
                  {job.title}
                </h3>
                <div className="flex items-center mt-2 text-gray-600">
                  <Building2
                    size={18}
                    className="mr-2 flex-shrink-0 text-orange-500"
                  />
                  <span className="truncate">{job.company}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    job.status === "Registered"
                      ? "bg-green-100 text-green-600"
                      : job.status === "Declined"
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin
                  size={18}
                  className="mr-2 flex-shrink-0 text-orange-500"
                />
                <span className="truncate">{job.location}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Banknote
                  size={18}
                  className="mr-2 flex-shrink-0 text-orange-500"
                />
                <span className="truncate">{job.salary}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar
                  size={18}
                  className="mr-2 flex-shrink-0 text-orange-500"
                />
                <span className="truncate">Ends on: {job.endDate}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Navigation
                  size={18}
                  className="mr-2 flex-shrink-0 text-orange-500"
                />
                <span className="truncate">{job.driveType}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <CheckCircle2
                  size={18}
                  className="mr-2 flex-shrink-0 text-orange-500"
                />
                <span className="truncate">
                  Registration Status: {job.registrationStatus}
                </span>
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
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-400 text-white py-1.5 px-3 rounded hover:bg-orange-500 transition-colors text-sm"
                >
                  <ThumbsUp size={16} />
                  Register
                </button>
                <button
                  onClick={() => handleThumbsDown(index)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-400 text-white py-1.5 px-3 rounded hover:bg-orange-400 transition-colors text-sm"
                >
                  <ThumbsDown size={16} />
                  Decline
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
