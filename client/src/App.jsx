import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import TeamDashboard from "./pages/TeamDashboard";
import AllTeams from "./pages/AllTeams";
import TeamCredentials from "./pages/TeamCredentials";

function ShellLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

function ShellLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/teams/:teamId"
        element={
          <ShellLayout>
            <TeamDashboard />
          </ShellLayout>
        }
      />

      <Route
        path="/all-teams"
        element={
          <ShellLayout>
            <AllTeams />
          </ShellLayout>
        }
      />

      <Route
        path="/team-credentials"
        element={
          <ShellLayout>
            <TeamCredentials />
          </ShellLayout>
        }
      />

      <Route path="/" element={<Navigate to="/teams/team-alpha" replace />} />
      <Route path="*" element={<Navigate to="/teams/team-alpha" replace />} />
    </Routes>
  );
}