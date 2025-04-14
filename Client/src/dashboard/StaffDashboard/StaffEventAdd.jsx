import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { postData } from "../../services/apiService";

const StaffEventAdd = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      eventName: "",
      eventLink: "",
      date: "",
    },
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data) => {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      let uploadData = {
        event_name: data.eventName,
        event_link: data.eventLink,
        date: data.date,
      };

      if (!data.eventName || !data.eventLink || !data.date) {
        throw new Error("⚠️ Event name, link, or date is missing!");
      }

      if (file) {
        const base64File = await convertFileToBase64(file);
        uploadData = {
          ...uploadData,
          file: base64File,
          fileName: file.name,
          fileType: file.type,
        };
      }

      const response = await postData("/staff/add-events", uploadData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess("Event added successfully!");
        toast.success("Event added successfully!");
        reset();
        setFile(null);
      } else {
        setSuccess("False");
        toast.error("Cannot add event, try again later.");
      }
    } catch (err) {
      toast.error("Failed to upload event.");

      if (err.response) {
        setError(
          `Failed to upload event: ${
            err.response?.data?.error || "Unknown error"
          }`
        );
      } else if (err.request) {
        setError("No response from server. Please try again.");
      } else {
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
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              {...register("eventName", { required: "Event name is required" })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.eventName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.eventName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Link
            </label>
            <input
              type="text"
              {...register("eventLink", { required: "Event link is required" })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.eventLink && (
              <p className="text-red-500 text-sm mt-1">
                {errors.eventLink.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              {...register("date", { required: "Date is required" })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date.message}
              </p>
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
              className="px-6 py-2  bg-orange-500 cursor-pointer text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
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