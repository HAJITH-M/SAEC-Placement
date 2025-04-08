import React, { useState } from "react";
import { Phone, User, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { postData } from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";

const AddPlacementCoordinatorsView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      dept: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await postData("superadmin/createcoordinators", [data], {
        withCredentials: true,
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Coordinator added successfully!");
        reset();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to add coordinator";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add Placement Coordinator
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-orange-500" />
              </div>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter coordinator name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <input
                {...register("dept", { required: "Department is required" })}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department"
              />
              {errors.dept && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dept.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <input
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                })}
                type="tel"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Add Coordinator
            </button>
          </div>
        </form>
      </div>
      <ToastContainer
       
      />
    </div>
  );
};

export default AddPlacementCoordinatorsView;
