import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nameOrEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/login", {
        nameOrEmail: formData.nameOrEmail,
        password: formData.password,
      });

      if (response.data.ok) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role);

        alert("Login successful! Welcome back!");

        switch (response.data.user.role) {
          
          case "HR Manager":
            navigate("/recruiter-dashboard");
            break;
          case "Employee":
            navigate("/employee-dashboard");
            break;
          case "Senior Technical Manager":
            navigate("/manager-dashboard");
            break;
          case "Admin":
            navigate("/admin-dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || 
        "Failed to login. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex justify-center items-center h-screen">
      <div className="login-container bg-white shadow-xl rounded-2xl p-8 w-96">
        <h1 className="login-title text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <div className="error-message bg-red-100 text-red-700 p-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form flex flex-col gap-4">
          <input
            type="text"
            name="nameOrEmail"
            placeholder="Name or Email"
            value={formData.nameOrEmail}
            onChange={handleChange}
            className="login-input p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="login-input p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="login-btn bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-text text-center text-gray-600 mt-4">
          Not a user?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="signup-link text-purple-600 hover:underline"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
