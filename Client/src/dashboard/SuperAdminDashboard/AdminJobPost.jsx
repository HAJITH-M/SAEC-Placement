import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { fetchData, postData } from "../../services/apiService";
import { generateContent, parseGeminiResponse } from "../../config/api";
import { useForm } from "react-hook-form";

const AdminJobPost = () => {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      companyName: "",
      jobDescription: "",
      driveDate: "",
      expiration: "",
      batch: "",
      department: "",
      role: "",
      lpa: "",
      driveLink: "",
      notificationEmail: []
    }
  });

  const [rawDescription, setRawDescription] = useState("");
  const [loading, setLoading] = useState(false);
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
        if (response.data && Array.isArray(response.data.groupMailList)) {
          const emailList = response.data.groupMailList
            .map((item) => (typeof item === "string" ? item : item.email))
            .filter(Boolean);
          setGroupEmails(emailList);
        } else {
          toast.error("Failed to parse notification email options");
        }
      } catch (err) {
        toast.error("Failed to load notification email options");
      }
    };
    fetchGroupEmails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "department") {
      setValue(name, value.split(",").map((d) => d.trim()).filter((d) => d));
    } else if (name === "notificationEmail") {
      const currentEmails = formData.notificationEmail || [];
      const updatedEmails = checked
        ? [...currentEmails, value]
        : currentEmails.filter((em) => em !== value);
      setValue(name, updatedEmails);
    } else {
      setValue(name, value);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
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
      reset({
        companyName: "",
        jobDescription: "",
        driveDate: "",
        expiration: "",
        batch: "",
        department: "",
        role: "",
        lpa: "",
        driveLink: "",
        notificationEmail: []
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

      reset({
        companyName: jobData.companyName || "Unknown Company",
        jobDescription: jobData.jobDescription || description,
        driveDate: driveDateFormatted || "",
        expiration: expirationFormatted || "",
        batch: jobData.batch || "",
        department: department.length > 0 ? department.join(", ") : "",
        role: jobData.role || "",
        lpa: jobData.lpa || "",
        driveLink: jobData.driveLink || "",
        notificationEmail: formData.notificationEmail || []
      });
    } catch (err) {
      toast.error(`Failed to analyze job description: ${err.message}`);
      setValue("jobDescription", description);
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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formattedData = {
        ...data,
        driveDate: formatDateForBackend(data.driveDate),
        expiration: formatDateForBackend(data.expiration, true),
        department: data.department.split(",").map((d) => d.trim()).filter((d) => d),
        notificationEmail: data.notificationEmail
      };
      await postData(`/superadmin/createjobs`, [formattedData], {
        withCredentials: true,
      });
      reset();
      setRawDescription("");
      toast.success("Job created successfully!");
    } catch (err) {
      toast.error(`Failed to create job: ${err.response?.data?.error || err.message}`);
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
          <div className="mt-1 text-xs text-gray-500">
            Note: If analysis fails, try shortening the job description or manually fill in the form.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                {...register("companyName", { required: "Company name is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="e.g., TechCorp"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Date
              </label>
              <input
                {...register("driveDate", { required: "Drive date is required" })}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              {errors.driveDate && (
                <p className="mt-1 text-sm text-red-500">{errors.driveDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <input
                {...register("batch", { required: "Batch is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="e.g., 2025"
              />
              {errors.batch && (
                <p className="mt-1 text-sm text-red-500">{errors.batch.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job CTC
              </label>
              <input
                {...register("lpa", { required: "Job CTC is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="e.g., 10 LPA"
              />
              {errors.lpa && (
                <p className="mt-1 text-sm text-red-500">{errors.lpa.message}</p>
              )}
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
                {...register("jobDescription", { required: "Job description is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                rows={3}
                placeholder="e.g., Software Engineer role..."
              />
              {errors.jobDescription && (
                <p className="mt-1 text-sm text-red-500">{errors.jobDescription.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <input
                {...register("expiration", { required: "Expiration date is required" })}
                type="datetime-local"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              {errors.expiration && (
                <p className="mt-1 text-sm text-red-500">{errors.expiration.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                {...register("role", { required: "Job role is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Software Engineer"
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Link
              </label>
              <input
                {...register("driveLink", { required: "Drive link is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="e.g., https://example.com/drive"
              />
              {errors.driveLink && (
                <p className="mt-1 text-sm text-red-500">{errors.driveLink.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departments (comma-separated)
              </label>
              <input
                {...register("department", { required: "At least one department is required" })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="e.g., Computer Science, IT"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>
              )}
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
                    {formData.notificationEmail?.length
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
                              checked={formData.notificationEmail?.includes(email)}
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