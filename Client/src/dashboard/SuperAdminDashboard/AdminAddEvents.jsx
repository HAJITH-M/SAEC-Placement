import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { postData } from "../../services/apiService";
import { useForm } from "react-hook-form";

const AdminAddEvents = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      event_name: "",
      event_link: "",
      date: "",
    },
  });

  const [eventData, setEventData] = useState({
    file: null,
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEventData((prev) => ({ ...prev, file }));
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data) => {
    setUploading(true);

    try {
      let uploadData = {
        event_name: data.event_name,
        event_link: data.event_link,
        date: data.date,
      };

      if (eventData.file) {
        const base64File = await convertFileToBase64(eventData.file);
        uploadData = {
          ...uploadData,
          file: base64File,
          fileName: eventData.file.name,
          fileType: eventData.file.type,
        };
      }

      const response = await postData("/superadmin/add-events", uploadData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Event added successfully!");
      reset();
      setEventData({ file: null });
      document.querySelector('input[type="file"]').value = null;
    } catch (err) {
      if (err.response) {
        toast.error(
          `Failed to upload event: ${
            err.response.data?.error || "Unknown error"
          }`
        );
      } else if (err.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Event</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              {...register("event_name", {
                required: "Event name is required",
              })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.event_name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.event_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Link
            </label>
            <input
              {...register("event_link", {
                required: "Event link is required",
              })}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.event_link && (
              <p className="mt-1 text-sm text-red-500">
                {errors.event_link.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              {...register("date", { required: "Date is required" })}
              type="date"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
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
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminAddEvents;
