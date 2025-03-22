import React, { useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";

const AdminAddEvents = () => {
  const [eventData, setEventData] = useState({
    event_name: "",
    event_link: "",
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
    console.log(`Updated field: ${name}, Value: ${value}`);
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
      console.log("Preparing upload data...");
      let uploadData = {
        event_name: eventData.event_name,
        event_link: eventData.event_link,
        date: eventData.date,
      };

      // Handle file upload
      if (eventData.file) {
        console.log("Converting file to Base64...");
        const base64File = await convertFileToBase64(eventData.file);
        
        uploadData = {
          ...uploadData,
          file: base64File,
          fileName: eventData.file.name,
          fileType: eventData.file.type,
        };
        console.log("File added to upload data:", uploadData);
      }

      console.log("Sending request to server...");
      const response = await axios.post(
        "http://localhost:9999/superadmin/add-events",
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Server response:", response);
      setSuccess("Event added successfully!");
      toast.success("Event added successfully!");
      setEventData({
        event_name: "",
        event_link: "",
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
          `Failed to upload event: ${err.response.data?.error || "Unknown error"}`
        );
      } else if (err.request) {
        console.log("No response received:", err.request);
        setError("No response from server. Please try again.");
      } else {
        console.log("Unexpected error:", err.message);
        setError("Unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            name="event_name"
            value={eventData.event_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Link</label>
          <input
            type="text"
            name="event_link"
            value={eventData.event_link}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Poster Upload</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm ${
            uploading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {uploading ? "Uploading..." : "Add Event"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AdminAddEvents;
