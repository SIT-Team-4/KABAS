import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell";
import TeamDashboard from "./pages/TeamDashboard";
import AllTeams from "./pages/AllTeams";
import TeamCredentials from "./pages/TeamCredentials";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TeamDashboard />} />
        <Route path="/all-teams" element={<AllTeams />} />
        <Route path="/team-credentials" element={<TeamCredentials />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}