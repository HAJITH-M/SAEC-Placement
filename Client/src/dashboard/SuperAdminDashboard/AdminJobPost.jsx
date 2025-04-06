import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { fetchData, postData } from "../../services/apiService";
import { generateContent, parseGeminiResponse } from "../../config/api";

const AdminJobPost = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    jobDescription: "",
    driveDate: "",
    expiration: "",
    batch: "",
    department: [],
    role: "",
    lpa: "",
    driveLink: "",
    notificationEmail: [],
  });
  const [rawDescription, setRawDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [groupEmails, setGroupEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchGroupEmails = async () => {
      try {
        const response = await fetchData(`/superadmin/getfeedgroupmail`, {
          withCredentials: true,
        });
        if (response.data && Array.isArray(response.data.groupMailList)) { // Fixed typo: groupMail_inches to groupMailList
          const emailList = response.data.groupMailList
            .map((item) => (typeof item === "string" ? item : item.email))
            .filter(Boolean);
          setGroupEmails(emailList);
        } else {
          setError("Failed to parse notification email options");
        }
      } catch (err) {
        setError("Failed to load notification email options");
      }
    };
    fetchGroupEmails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFormData({
        ...formData,
        [name]: value
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d),
      });
    } else if (name === "notificationEmail") {
      const updatedEmails = e.target.checked
        ? [...formData.notificationEmail, value]
        : formData.notificationEmail.filter((em) => em !== value);
      setFormData({ ...formData, notificationEmail: updatedEmails });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true); // Open dropdown when typing starts
  };

  const formatDateForBackend = (dateStr, includeTime = false) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (includeTime) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = "00";
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        return date.toISOString().split("T")[0];
      }
    } catch (err) {
      return dateStr;
    }
  };

  const formatDateForInput = (dateStr) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (err) {
      return dateStr;
    }
  };

  const analyzeJobDescription = async (description) => {
    if (!description) {
      setError(null);
      setFormData({
        companyName: "",
        jobDescription: "",
        driveDate: "",
        expiration: "",
        batch: "",
        department: [],
        role: "",
        lpa: "",
        driveLink: "",
        notificationEmail: [],
      });
      return;
    }

    try {
      setLoading(true);
      setRetryCount(0);

      const prompt = `
        Extract the following fields from the job description below and return them in JSON format:
        - companyName (string)
        - jobDescription (string)
        - driveDate (string, MM/DD/YYYY)
        - expiration (string, MM/DD/YYYY hh:mm AM/PM)
        - batch (string)
        - department (array of strings)
        - role (string)
        - lpa (string, e.g., "10 LPA" or "500000")
        - driveLink (string, URL)
        
        Return only valid JSON without any markdown formatting or explanations.
        
        Job Description: ${description}
      `;

      const responseData = await generateContent(prompt, MAX_RETRIES, 1000);
      let aiData = parseGeminiResponse({ data: responseData });

      const jobData = Array.isArray(aiData) ? aiData[0] : aiData;

      let driveDateFormatted = "";
      if (jobData.driveDate) {
        const parts = jobData.driveDate.split("/");
        if (parts.length === 3) {
          const [month, day, year] = parts.map(Number);
          const date = new Date(year, month - 1, day);
          driveDateFormatted = isNaN(date.getTime())
            ? ""
            : date.toISOString().split("T")[0];
        }
      }

      let expirationFormatted = "";
      if (jobData.expiration) {
        const dateParts = jobData.expiration.split(/\s+/);
        if (dateParts.length >= 3) {
          const [datePart, timePart, period] = dateParts;
          const [month, day, year] = datePart.split("/").map(Number);

          let hours = 0,
            minutes = 0;
          if (timePart) {
            const [h, m] = timePart.split(":").map(Number);
            hours = h;
            minutes = m || 0;
            if (period) {
              if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
              if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
            }
          }
          const date = new Date(year, month - 1, day, hours, minutes);
          if (!isNaN(date.getTime())) {
            expirationFormatted = formatDateForInput(date);
          }
        }
      }

      const department = Array.isArray(jobData.department)
        ? jobData.department
        : typeof jobData.department === "string"
        ? [jobData.department]
        : [];

      const updatedFormData = {
        companyName: jobData.companyName || "Unknown Company",
        jobDescription: jobData.jobDescription || description,
        driveDate: driveDateFormatted || "",
        expiration: expirationFormatted || "",
        batch: jobData.batch || "",
        department: department.length > 0 ? department : [],
        role: jobData.role || "",
        lpa: jobData.lpa || "",
        driveLink: jobData.driveLink || "",
        notificationEmail: formData.notificationEmail,
      };

      setFormData(updatedFormData);
      setError(null);
    } catch (err) {
      setError(`Failed to analyze job description: ${err.message}`);
      setFormData((prev) => ({
        ...prev,
        companyName: prev.companyName || "Error Parsing",
        jobDescription: description,
        notificationEmail: prev.notificationEmail,
      }));
      setRetryCount(retryCount + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    if (rawDescription.trim()) analyzeJobDescription(rawDescription);
  };

  const handleManualRetry = () => {
    if (rawDescription.trim()) analyzeJobDescription(rawDescription);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...formData,
        driveDate: formatDateForBackend(formData.driveDate),
        expiration: formatDateForBackend(formData.expiration, true),
        notificationEmail: formData.notificationEmail,
      };
      await postData(`/superadmin/createjobs`, [formattedData], {
        withCredentials: true,
      });
      setFormData({
        companyName: "",
        jobDescription: "",
        driveDate: "",
        expiration: "",
        batch: "",
        department: [],
        role: "",
        lpa: "",
        driveLink: "",
        notificationEmail: [],
      });
      setRawDescription("");
      setError(null);
      toast.success("Job created successfully!");
    } catch (err) {
      setError(
        `Failed to create job: ${err.response?.data?.error || err.message}`
      );
      toast.error("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = groupEmails.filter((email) =>
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full p-2 md:p-6 bg-slate-50 min-h-screen">
      <div className="bg-slate-50 rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create New Job Posting
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
            {retryCount > 0 && retryCount < MAX_RETRIES && (
              <div className="mt-2">
                <button
                  onClick={handleManualRetry}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Retry Analysis
                </button>
                <span className="ml-2 text-xs text-gray-500">
                  (Attempt {retryCount + 1}/{MAX_RETRIES})
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description for AI Analysis
          </label>
          <textarea
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Paste the full job description here..."
            rows={4}
          />
          <button
            onClick={handleAutoFill}
            disabled={loading || !rawDescription.trim()}
            className="mt-3 px-4 py-2 bg-orange-500 cursor-pointer text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Analyzing..." : "Auto Fill"}
          </button>
          <div className="mt-1 text-xs text-gray-500">
            Note: If analysis fails, try shortening the job description or
            manually fill in the form.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., TechCorp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Date
              </label>
              <input
                type="date"
                name="driveDate"
                value={formData.driveDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job CTC
              </label>
              <input
                type="text"
                name="lpa"
                value={formData.lpa}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., 10 LPA"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-2 bg-orange-500 cursor-pointer text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                rows={3}
                placeholder="e.g., Software Engineer role..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <input
                type="datetime-local"
                name="expiration"
                value={formData.expiration}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Link
              </label>
              <input
                type="text"
                name="driveLink"
                value={formData.driveLink}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., https://example.com/drive"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departments (comma-separated)
              </label>
              <input
                type="text"
                name="department"
                value={formData.department.join(", ")}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                required
                placeholder="e.g., Computer Science, IT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Emails
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mb-2"
                placeholder="Search emails..."
              />
              <div className="relative">
                <div
                  onClick={toggleDropdown}
                  className="w-full p-3 border border-gray-300 rounded-md cursor-pointer flex justify-between items-center bg-white text-gray-700 text-sm hover:bg-gray-50 transition-all"
                >
                  <span>
                    {formData.notificationEmail.length
                      ? `${formData.notificationEmail.length} selected`
                      : "Select emails"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {isOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10 h-40 overflow-y-auto">
                    <div className="p-2">
                      {filteredEmails.length > 0 ? (
                        filteredEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center py-1 px-2 hover:bg-gray-100 rounded"
                          >
                            <input
                              type="checkbox"
                              id={`email-${index}`}
                              name="notificationEmail"
                              value={email}
                              checked={formData.notificationEmail.includes(
                                email
                              )}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`email-${index}`}
                              className="ml-2 text-sm text-gray-700 truncate"
                            >
                              {email}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 py-2 px-3">
                          {searchQuery
                            ? "No emails match your search"
                            : "No email groups available"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminJobPost;