// src/components/employee/CommunicationPanel.jsx
import React from "react";
import DepartmentChat from "./DepartmentChat";
import TeamDirectory from "./TeamDirectory";
import Announcements from "./Announcements";

export default function CommunicationPanel({ department, team, announcements }) {
  return (
    <section className="space-y-4">
      <DepartmentChat department={department}/>
      <TeamDirectory team={team}/>
      <Announcements items={announcements}/>
    </section>
  )
}
