// src/utils/apiMock.js
export const currentUser = {
  empId: "EMP045",
  name: "Arjun Patel",
  email: "arjun.patel@example.com",
  department: "Engineering",
  jobTitle: "Senior Developer",
  reportingManager: "EMP008",
};

export const mockTodaySchedule = [
  { time: "10:00 AM", title: "Sprint Standup", type: "meeting" },
  { time: "1:00 PM", title: "Half-day leave", type: "leave" },
];

export const mockNotifications = [
  { id: 1, text: "Performance review due in 3 days", level: "urgent" },
  { id: 2, text: "1 unread message from manager", level: "info" },
];

export const mockLeaveBalance = {
  annual: { used: 5, available: 15, pending: 1 },
  sick: { used: 2, available: 8, pending: 0 },
  casual: { used: 1, available: 4, pending: 0 },
};

export const mockAttendanceLog = [
  { date: "2025-10-13", in: "09:05", out: "18:10", hours: 9.08 },
  { date: "2025-10-14", in: "09:00", out: "17:45", hours: 8.75 },
  { date: "2025-10-15", in: "09:10", out: "18:00", hours: 8.83 },
];

export const mockTasks = [
  { id: 1, name: "Implement payments API", priority: "High", due: "2025-10-20", status: "In Progress" },
  { id: 2, name: "Fix onboarding bug", priority: "Medium", due: "2025-10-18", status: "To-Do" },
];

export const mockTeam = [
  { empId: "EMP008", name: "Priya Sharma", title: "Manager", email: "priya@company.com", status: "Online" },
  { empId: "EMP050", name: "Rahul Verma", title: "Junior Developer", email: "rahul@company.com", status: "On Leave" },
  { empId: "EMP046", name: "Nisha Singh", title: "Senior Developer", email: "nisha@company.com", status: "Away" },
];

export const mockAnnouncements = [
  { id: 1, scope: "Company", text: "Quarterly results published — check Finance portal", date: "2025-10-10" },
  { id: 2, scope: "Engineering", text: "Deployment window Friday 8pm", date: "2025-10-14" },
];
