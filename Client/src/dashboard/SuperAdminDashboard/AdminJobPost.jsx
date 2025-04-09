import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { fetchData, postData } from "../../services/apiService";
import { generateContent, parseGeminiResponse } from "../../config/api";
import { useForm } from "react-hook-form";

const AdminJobPost = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
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
      notificationEmail: [],
    },
  });

  const formData = watch();
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
        console.log("Received group emails:", response.data.groupMailList);
        if (response?.data?.groupMailList) {
          const emailList = response.data.groupMailList
            .map((item) => (typeof item === "string" ? item : item?.email))
            .filter(Boolean);
          setGroupEmails(emailList);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Failed to parse notification email options");
        }
      } catch (err) {
        console.error("Failed to fetch group emails:", err);
        setError("Failed to load notification email options");
      }
    };
    fetchGroupEmails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "notificationEmail") {
      const currentEmails = formData.notificationEmail || [];
      const updatedEmails = checked
        ? [...currentEmails, value]
        : currentEmails.filter((em) => em !== value);
      setValue(name, updatedEmails);
    } else if (name === "department") {
      setValue(name, value.split(",").map((d) => d.trim()).filter(Boolean));
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
      if (isNaN(date.getTime())) return "";
      if (includeTime) {
        return date.toISOString().replace("T", " ").split(".")[0];
      }
      return date.toISOString().split("T")[0];
    } catch (err) {
      console.error("Date formatting error:", err.message);
      return "";
    }
  };

  const formatDateForInput = (dateStr, isDateOnly = false) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      if (isDateOnly) {
        return date.toISOString().split("T")[0]; // YYYY-MM-DD for date input
      }
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM for datetime-local
    } catch (err) {
      console.error("Date formatting for input error:", err.message);
      return "";
    }
  };

  const analyzeJobDescription = async (description) => {
    if (!description?.trim()) {
      reset();
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setRetryCount((prev) => prev + 1);

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

      const response = await generateContent(prompt, MAX_RETRIES, 1000);
      const responseData = response.data;
      console.log("Raw API Response:", JSON.stringify(responseData, null, 2));

      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "No content available";
      console.log("Full Raw Text from Gemini:", rawText);

      let aiData;
      try {
        aiData = parseGeminiResponse({ data: responseData });
        console.log("Parsed AI Data:", JSON.stringify(aiData, null, 2));
      } catch (parseErr) {
        console.error("Parsing Error:", parseErr);
        const rawSnippet = rawText.substring(0, 100);
        throw new Error(`Failed to parse AI response as JSON. Raw response snippet: ${rawSnippet}...`);
      }

      if (!aiData || (Array.isArray(aiData) && aiData.length === 0)) {
        throw new Error("Parsed AI data is empty or invalid");
      }

      const jobData = Array.isArray(aiData) ? aiData[0] || {} : aiData;

      let driveDateFormatted = "";
      if (jobData.driveDate) {
        try {
          const [month, day, year] = (jobData.driveDate || "").split("/").map(Number);
          const date = new Date(year, month - 1, day);
          driveDateFormatted = isNaN(date.getTime()) ? "" : formatDateForInput(date, true);
        } catch (err) {
          console.error("Error parsing drive date:", err);
        }
      }

      let expirationFormatted = "";
      if (jobData.expiration) {
        try {
          const parts = (jobData.expiration || "").split(" ");
          if (parts.length >= 3) {
            const [datePart, timePart, period] = parts;
            const [month, day, year] = (datePart || "").split("/").map(Number);
            const [hours, minutes] = (timePart || "0:0").split(":").map(Number);
            const adjustedHours =
              period?.toUpperCase() === "PM" && hours !== 12
                ? hours + 12
                : period?.toUpperCase() === "AM" && hours === 12
                ? 0
                : hours;
            const date = new Date(year, month - 1, day, adjustedHours, minutes || 0);
            expirationFormatted = isNaN(date.getTime()) ? "" : formatDateForInput(date);
          }
        } catch (err) {
          console.error("Error parsing expiration date:", err);
        }
      }

      const department = Array.isArray(jobData.department)
        ? jobData.department
        : typeof jobData.department === "string"
        ? jobData.department.split(",").map((d) => d.trim()).filter(Boolean)
        : [];

      reset({
        companyName: jobData.companyName || "",
        jobDescription: jobData.jobDescription || description,
        driveDate: driveDateFormatted,
        expiration: expirationFormatted,
        batch: jobData.batch || "",
        department: department.join(", "),
        role: jobData.role || "",
        lpa: jobData.lpa || "",
        driveLink: jobData.driveLink || "",
        notificationEmail: formData.notificationEmail || [],
      });
      setError(null);
    } catch (err) {
      console.error("Analysis Error Details:", err.message, err.stack);
      const errorMsg = `Failed to analyze job description: ${err.message}`;
      setError(errorMsg);
      reset({
        companyName: "",
        jobDescription: description,
        driveDate: "",
        expiration: "",
        batch: "",
        department: "",
        role: "",
        lpa: "",
        driveLink: "",
        notificationEmail: formData.notificationEmail || [],
      });
      if (retryCount >= MAX_RETRIES) {
        setRetryCount(0);
      }
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
        department: data.department.split(",").map((d) => d.trim()).filter(Boolean),
        notificationEmail: data.notificationEmail || [],
      };
      console.log("Data being sent to /superadmin/createjobs:", [formattedData]);
      await postData(`/superadmin/createjobs`, [formattedData], {
        withCredentials: true,
      });
      
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
        notificationEmail: [],
      });
      setRawDescription("");
      setError(null);
      setSearchQuery("");
      setIsOpen(false);
      toast.success("Job created successfully!");
      console.log("Form reset triggered after successful submission");
    } catch (err) {
      const errorMsg = `Failed to create job: ${err.response?.data?.error || err.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = groupEmails.filter((email) =>
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  return (
    <div className="w-full p-2 md:p-6 bg-slate-50 min-h-screen">
      <div className="bg-slate-50 rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create New Job Posting
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
            {retryCount > 0 && retryCount <= MAX_RETRIES && (
              <div className="mt-2">
                <button
                  onClick={handleManualRetry}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Retry Analysis
                </button>
                <span className="ml-2 text-xs text-gray-500">
                  (Attempt {retryCount}/{MAX_RETRIES})
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