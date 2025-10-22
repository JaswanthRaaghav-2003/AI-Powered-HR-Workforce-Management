import React from "react";

const OnboardingWorkflow = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Onboarding / Offboarding Workflow Manager</h2>
    <p className="text-gray-700 mb-4">
      Monitor and configure automated workflows for new hires and exiting employees.
    </p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-100 p-4 rounded-lg">
        <h3 className="font-semibold">Onboarding Tasks</h3>
        <ul className="list-disc pl-6 text-sm mt-2">
          <li>Document Verification</li>
          <li>System Access Creation</li>
          <li>Orientation Scheduling</li>
        </ul>
      </div>
      <div className="bg-red-100 p-4 rounded-lg">
        <h3 className="font-semibold">Offboarding Tasks</h3>
        <ul className="list-disc pl-6 text-sm mt-2">
          <li>Asset Return</li>
          <li>Exit Interview</li>
          <li>Final Settlement</li>
        </ul>
      </div>
    </div>
  </div>
);

export default OnboardingWorkflow;
