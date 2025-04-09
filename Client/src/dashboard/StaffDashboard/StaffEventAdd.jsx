import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { postData } from "../../services/apiService";

const StaffEventAdd = () => {
  const [eventData, setEventData] = useState({
    eventName: "",
    eventLink: "",
    date: "",
    file: null,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      setEventData((prev) => ({ ...prev, file }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log("File read successfully.");
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🧪 Current eventData state before upload:", eventData);

      let uploadData = {
        event_name: eventData.eventName,
        event_link: eventData.eventLink,
        date: eventData.date,
      };

      if (!eventData.eventName || !eventData.eventLink || !eventData.date) {
        throw new Error("⚠️ Event name, link, or date is missing!");
      }

      if (eventData.file) {
        console.log("Converting file to Base64...");
        const base64File = await convertFileToBase64(eventData.file);
        uploadData = {
          ...uploadData,
          file: base64File,
          fileName: eventData.file.name,
          fileType: eventData.file.type,
        };
      }

      const response = await postData("/staff/add-events", uploadData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      console.log("Server response:", response);
      if (response.ok) {
        setSuccess("Event added successfully!");
        toast.success("Event added successfully!");
      } else {
        setSuccess("False");
        toast.error("Cannot add event try again later..");
      }
      setEventData({
        eventName: "",
        eventLink: "",
        date: "",
        file: null,
      });
    } catch (err) {
      console.error("Error during event upload:", err);
      toast.error("Failed to upload event.");

      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error status:", err.response.status);
        setError(
          `Failed to upload event: ${
            err.response?.data?.error || "Unknown error"
          }`
        );
      } else if (err.request) {
        console.log("No response received:", err.request);
        setError("No response from server. Please try again.");
      } else {
        console.log("Unexpected error:", err.message);
        setError(err.message || "Unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full p-2 md:p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Event</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={eventData.eventName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Link
            </label>
            <input
              type="text"
              name="eventLink"
              value={eventData.eventLink}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poster Upload
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="col-span-full flex justify-start">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-orange-500 cursor-pointer text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? "Uploading..." : "Add Event"}
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default StaffEventAdd;
