import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import OfficialDashboard from "./pages/OfficialDashboard";
import ComplaintDetail from "./pages/ComplaintDetail";
import PublicTransparency from "./pages/PublicTransparency";
import ReportsPage from "./pages/ReportsPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({
  officialEl,
  citizenEl,
}: {
  officialEl: React.ReactNode;
  citizenEl: React.ReactNode;
}) {
  const { user } = useAuth();
  return user?.role === "official" || user?.role === "admin" ? (
    <>{officialEl}</>
  ) : (
    <>{citizenEl}</>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/transparency" element={<PublicTransparency />} />
      <Route
        path="/reports"
        element={
          <RequireAuth>
            <ReportsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <RoleRoute
              officialEl={<OfficialDashboard />}
              citizenEl={<CitizenDashboard />}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <RequireAuth>
            <ComplaintDetail />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
