import React from "react";
import { FaUserTie, FaUserShield, FaUsers, FaClipboardList, FaLaptopCode, FaClock, FaFileAlt, FaSmile } from "react-icons/fa";

const HowItWorks = () => {
  const features = [
    {
      title: "HR Dashboard",
      icon: <FaUserTie className="w-8 h-8 text-white" />,
      description: `Post jobs that reflect instantly on the careers page. AI-based shortlisting evaluates resumes against job descriptions for quick selection.`,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      title: "Admin Dashboard",
      icon: <FaUserShield className="w-8 h-8 text-white" />,
      description: `Upload employee data, approve or reject signup requests, and maintain overall employee records securely.`,
      gradient: "from-green-500 to-teal-600",
    },
    {
      title: "Senior Manager Dashboard",
      icon: <FaLaptopCode className="w-8 h-8 text-white" />,
      description: `Assign tasks, manage leave approvals, and privately chat with department members to ensure smooth workflow.`,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      title: "Employee Dashboard",
      icon: <FaUsers className="w-8 h-8 text-white" />,
      description: `Track attendance, request leaves from managers, and participate in department group chats seamlessly.`,
      gradient: "from-pink-500 to-red-500",
    },
    {
      title: "Facial Attendance",
      icon: <FaSmile className="w-8 h-8 text-white" />,
      description: `Automated facial attendance system ensures accurate tracking of all employees without manual intervention.`,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Job Applications",
      icon: <FaFileAlt className="w-8 h-8 text-white" />,
      description: `Employees can apply for jobs, HR can manage applications efficiently, and AI-assisted resume scanning improves selection quality.`,
      gradient: "from-gray-500 to-gray-700",
    },
    {
      title: "Attendance & Leave Management",
      icon: <FaClock className="w-8 h-8 text-white" />,
      description: `Employees can see their attendance records, request leaves, and managers can approve or reject with full transparency.`,
      gradient: "from-teal-400 to-cyan-600",
    },
  ];

  return (
    <section className=" text-white py -50 py-20 px-4 md:px-16">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-4xl font-bold text-white-800 mb-4">How Our Application Works</p>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Our platform streamlines HR processes, employee management, and departmental workflows with smart dashboards and AI-assisted tools. Explore the features below.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col items-start p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-r ${feature.gradient}`}
          >
            <div className="mb-4 bg-white p-3 rounded-full inline-flex">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-white text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-20 text-center">
        <p className="text-gray-700 text-lg mb-4">
          Experience the full power of smart HR management, AI-driven recruitment, and automated attendance today.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300"
        >
          Get Started
        </a>
      </div>
    </section>
  );
};

export default HowItWorks;
