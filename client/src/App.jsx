import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell";
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import TeamDashboard from "./pages/TeamDashboard";
import AllTeams from "./pages/AllTeams";
import TeamCredentials from "./pages/TeamCredentials";

function ShellLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/all-teams" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/teams/:teamId"
        element={
          <RequireAuth>
            <ShellLayout>
              <TeamDashboard />
            </ShellLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/all-teams"
        element={
          <RequireAuth>
            <ShellLayout>
              <AllTeams />
            </ShellLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/team-credentials"
        element={
          <RequireAuth>
            <ShellLayout>
              <TeamCredentials />
            </ShellLayout>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
