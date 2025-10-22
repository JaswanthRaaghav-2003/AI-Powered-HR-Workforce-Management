import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeDatabase = () => {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/users"; // Backend endpoint

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Employee data:", res.data); // 👈 Debug check
        setEmployees(Array.isArray(res.data) ? res.data : res.data.users);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filtered = employees.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-white">Loading employees...</p>;

  return (
    <div>
      <p className="text-3xl font-semibold mb-4 text-gray-100">
        Master Employee Database
      </p>

      <input
        type="text"
        placeholder="Search employee"
        className="border border-white text-white placeholder-white bg-transparent p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-white transition duration-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border bg-white rounded-lg text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Department</th>
              <th className="p-2">Job Title</th>
              <th className="p-2">Salary/Annum</th>
              <th className="p-2">Bank</th>
              <th className="p-2">DOB</th>
              <th className="p-2">Address</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Reporting Manager</th>
              <th className="p-2">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="12"
                  className="text-center p-4 text-gray-500 italic"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{e.empId || "-"}</td>
                  <td className="p-2">{e.name}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2">{e.department || "-"}</td>
                  <td className="p-2">{e.jobTitle || "-"}</td>
                  <td className="p-2">
                    {e.salaryPerAnnum
                      ? `₹${e.salaryPerAnnum.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="p-2">{e.bankName || "-"}</td>
                  <td className="p-2">
                    {e.dob ? new Date(e.dob).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-2">{e.address || "-"}</td>
                  <td className="p-2">{e.mobile || "-"}</td>
                  <td className="p-2">{e.reportingManager || "-"}</td>
                  <td className="p-2">{e.attendancePct ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDatabase;

