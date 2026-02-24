import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  const { initialize, user, loading } = useAuthStore();

  useEffect(() => {
    const boot = async () => {
      await initialize();
    };
    boot();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-darkest text-neutral-lightest">
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
