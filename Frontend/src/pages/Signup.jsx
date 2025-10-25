import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(""); // Clear error on input change
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/signup", {
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.data.ok) {
        // Store token and user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role);

        alert("Signup successful! Welcome aboard!");
        
        // Navigate based on role
      
            navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.error || 
        "Wait for ADMIN Approval you can signin when the ADMIN Approves your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Create Your Account ✨</h1>

        {error && (
          <div className="error-message" style={{
            backgroundColor: "#fee",
            color: "#c33",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={loading}
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={form.email}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={loading}
          />

          {/* Role Dropdown */}
         <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="signup-input"
        required
        disabled={loading}
          >
  <option value="">Select Role</option>
  <option value="HR Manager">HR Manager</option>
  <option value="Employee">Employee</option>
  <option value="Senior Technical Manager">Senior Technical Manager</option>
</select>


         {/* Department Dropdown */}
<select
  name="department"
  value={form.department}
  onChange={handleChange}
  className="signup-input"
  required={form.role !== "HR Manager"} // Required only if role is NOT HR Manager
  disabled={loading || form.role === "HR Manager"} // Disabled if HR Manager
>
  <option value="">Select Department</option>
  <option value="Sales">Sales</option>
  <option value="Finance">Finance</option>
  <option value="Engineering">Engineering</option>
  <option value="HR">HR</option>
</select>

          {/* Create Password */}
          <input
            type="password"
            name="password"
            placeholder="Create Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={loading}
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="signup-input"
            required
            disabled={loading}
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            className="signup-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Signin Navigation */}
        <p className="signin-text">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="signin-link"
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;