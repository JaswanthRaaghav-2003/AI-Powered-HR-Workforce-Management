Full-Stack Employee Management & Recruitment System

This is a full-stack web application with role-based dashboards, job posting, employee management, task assignment, department chat, and Gemini API integration for candidate shortlisting.

Project Features

Role-Based Dashboards: Admin, HR Recruiter, Senior Manager, Employee

Job Posting & Application: HR can post jobs, candidates can apply, shortlisting with Gemini API

Employee Management: Bulk upload via Excel, approve/reject new signups

Tasks & Leave Management: Employees receive tasks, request leave; managers approve leave and rate performance

Department Chat: Real-time chat among department employees

Project Structure

Backend: Node.js + Express + MongoDB + Socket.IO + Gemini API

Frontend: React + Tailwind CSS + Socket.IO-client + Axios

Authentication: JWT-based

Database: MongoDB

Prerequisites

Node.js
 v18+

npm
 or yarn

MongoDB


Backend Setup

Open VS Code and navigate to the backend folder.

Install dependencies:

npm install


Create a .env file in the backend root with the following variables:

PORT=5000
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<your_gemini_api_key>


Start the backend server:

npm run dev


The server should run at http://localhost:5000.

Frontend Setup

Open VS Code and navigate to the frontend folder.

Install dependencies:

npm install


Update API URL in .env (if used) or in Axios calls:

REACT_APP_API_BASE_URL=http://localhost:5000


Start the React app:

npm start


The frontend should run at http://localhost:3000.

Login Credentials

Admin: Admin@123

Senior Manager: balakumar / Srec@123

All Employees: Welcome@123

Usage

Admin can upload bulk employee data, approve/reject signups.

HR can post jobs and shortlist candidates with Gemini API.

Managers assign tasks and approve leaves.

Employees can view tasks, request leave, and use department chat.
 (local or Atlas)

VS Code with recommended extensions (Prettier, ESLint)
