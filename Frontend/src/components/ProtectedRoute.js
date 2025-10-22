// src/components/ProtectedRoute.js
// Use this to protect your dashboard routes

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

// Example usage in your App.js or router:
/*
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/recruiter-dashboard" 
  element={
    <ProtectedRoute allowedRoles={['HR Recruiter']}>
      <RecruiterDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-dashboard" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/hr-dashboard" 
  element={
    <ProtectedRoute allowedRoles={['HR Manager', 'HR Recruiter']}>
      <HRDashboard />
    </ProtectedRoute>
  } 
/>
*/