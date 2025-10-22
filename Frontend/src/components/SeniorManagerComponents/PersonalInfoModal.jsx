// src/components/SeniorManagerComponents/PersonalInfoModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ||"http://localhost:5000"; 

const PersonalInfoModal = ({ onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    emergencyContact: "",
    bank: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch employee info from backend
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/employee/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.ok) {
          setEmployee(res.data.employee);
          setForm({
            phone: res.data.employee.mobile || "",
            emergencyContact: res.data.employee.emergencyContact || "",
            bank: res.data.employee.bankName || "",
            currentPassword: "",
            newPassword: "",
          });
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        alert("Failed to load employee info");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/employee/update-personal-info`,
        {
          phone: form.phone,
          emergencyContact: form.emergencyContact,
          bank: form.bank,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Personal information updated!");
      onClose();
    } catch (err) {
      console.error("Error updating info:", err);
      alert("Failed to update information.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!form.currentPassword || !form.newPassword)
        return alert("Please fill both password fields.");
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/employee/update-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setForm({ ...form, currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      alert(err.response?.data?.error || "Failed to update password.");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-xl w-96 text-white">
          Loading employee info...
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-xl w-96 text-white max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl mb-4 font-semibold text-center">
          Personal Information
        </h3>

        {/* Basic Info (non-editable) */}
        <div className="mb-4 border-b border-gray-600 pb-3">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Job Title:</strong> {employee.jobTitle}</p>
        </div>

        {/* Editable Info */}
        <label className="block mb-2 text-sm">Phone Number</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full bg-gray-700 p-2 rounded-md mb-3"
        />

        <label className="block mb-2 text-sm">Emergency Contact</label>
        <input
          name="emergencyContact"
          value={form.emergencyContact}
          onChange={handleChange}
          className="w-full bg-gray-700 p-2 rounded-md mb-3"
        />

        <label className="block mb-2 text-sm">Bank Details</label>
        <input
          name="bank"
          value={form.bank}
          onChange={handleChange}
          className="w-full bg-gray-700 p-2 rounded-md mb-3"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-600 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Password Update Section */}
        <h3 className="text-lg mt-6 mb-3 font-semibold border-t border-gray-600 pt-3">
          Change Password
        </h3>
        <label className="block mb-2 text-sm">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          className="w-full bg-gray-700 p-2 rounded-md mb-3"
        />

        <label className="block mb-2 text-sm">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full bg-gray-700 p-2 rounded-md mb-3"
        />

        <button
          onClick={handlePasswordChange}
          className="w-full mt-2 py-2 bg-green-500 rounded-md hover:bg-green-600"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoModal;
