import React, { useState, useEffect } from "react";
import { resetPassword } from "../../../config/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const StudentResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    console.log("Raw hash:", hash);

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");

    console.log("Extracted Token:", accessToken);

    if (accessToken) {
      setToken(accessToken);
    } else {
      console.log("Invalid or missing token");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      console.log("Invalid or missing token");
      return;
    }

    try {
      const response = await resetPassword("student", token, newPassword);
      console.log("Reset Password Response:", response);
      toast.success(response.message || "Password updated successfully!");

      setTimeout(() => {
        toast.success("redirecting to login page now");
        navigate("/auth/student");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to reset password.");
    }
  };

  return (
    <div>
      <h2>Student Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button onClick={handleSubmit}>Reset Password</button>
      <ToastContainer />
    </div>
  );
};

export default StudentResetPassword;
