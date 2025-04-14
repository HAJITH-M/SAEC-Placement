import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import { postData } from "../../services/apiService";
import { useForm } from "react-hook-form";

const AdminAddMailForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emails: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const extractedEmails = jsonData
          .flat()
          .map((email) => (typeof email === "string" ? email.trim() : ""))
          .filter((email) => email && /^\S+@\S+\.\S+$/.test(email));

        setValue("emails", extractedEmails.join("\n"));
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const emailArray = data.emails
        .split(/[\n,]/)
        .map((email) => email.trim())
        .filter((email) => email)
        .filter((email) => /^\S+@\S+\.\S+$/.test(email));

      if (emailArray.length === 0) {
        toast.error("Please enter or upload at least one valid email address");
        setLoading(false);
        return;
      }

      const response = await postData(`/superadmin/feedgroupmail`, emailArray, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Successfully added emails");
      setValue("emails", "");
      setFile(null);
      document.getElementById("excel-upload").value = null;
    } catch (err) {
      toast.error("Failed to add emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-3 md:p-6 pb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add Group Notification Emails
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Excel File
            </label>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload an Excel file with emails in the first column
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or Enter Email Addresses Manually
            </label>
            <textarea
              {...register("emails")}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Enter emails (one per line or comma-separated)\ne.g., email1@example.com, email2@example.com"
              rows={5}
            />
            {errors.emails && (
              <p className="mt-1 text-sm text-red-500">
                {errors.emails.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter valid email addresses separated by commas or on new lines
            </p>
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2  bg-orange-500 text-white rounded-md cursor-pointer hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Adding..." : "Add Emails"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminAddMailForm;
