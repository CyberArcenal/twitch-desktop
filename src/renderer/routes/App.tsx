// src/routes/App.tsx
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import { HelpPage } from "../pages/help";
import LoginPage from "../pages/auth/login";

// ─── Generic Placeholder (reusable) ─────────────────────────────
const PlaceholderPage = ({
  title,
  message,
}: {
  title: string;
  message?: string;
}) => {
  const location = window.location.pathname;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-[#9146ff]/10 flex items-center justify-center">
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#a970ff] bg-clip-text text-transparent mb-3">
        {title}
      </h1>
      <p className="text-[#adadb8] max-w-md mb-6">
        {message ||
          "This page is under construction. It will be available soon."}
      </p>
      <div className="text-xs text-[#5e5e6b] bg-[#1f1f23] px-3 py-1 rounded-full">
        Route: {location}
      </div>
    </div>
  );
};

// ─── Auth Guard (redirect to login if not authenticated) ────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Make sure your authAPI is correctly imported
        const { authAPI } = await import("../api/core/auth");
        const result = await authAPI.isLoggedIn();
        setIsAuthenticated(result.data);
        if (!result.data) navigate("/login", { replace: true });
      } catch (err) {
        console.error("Auth check failed", err);
        navigate("/login", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    // Optionally show a loading spinner
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#9146ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

// ─── Main App ────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    if (typeof window.backendAPI?.notifyAppReady === "function") {
      window.backendAPI.notifyAppReady();
      console.log("Notified main process: renderer is ready");
    }
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/help" element={<HelpPage />} />

      {/* Protected routes (require login) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route
          index
          element={
            <PlaceholderPage title="Dashboard" message="Your personalized Twitch overview is coming soon." />
          }
        />
        <Route
          path="dashboard"
          element={
            <PlaceholderPage title="Dashboard" message="Your personalized Twitch overview is coming soon." />
          }
        />

        {/* Following */}
        <Route
          path="following"
          element={
            <PlaceholderPage title="Following" message="Live channels you follow will appear here." />
          }
        />

        {/* Browse section */}
        <Route
          path="browse/categories"
          element={
            <PlaceholderPage title="Categories" message="Browse games and categories." />
          }
        />
        <Route
          path="browse/top-games"
          element={
            <PlaceholderPage title="Top Games" message="Most popular games on Twitch." />
          }
        />
        <Route
          path="browse/live"
          element={
            <PlaceholderPage title="Live Channels" message="Discover live streams right now." />
          }
        />
        <Route
          path="browse/clips"
          element={
            <PlaceholderPage title="Popular Clips" message="Trending clips from the community." />
          }
        />

        {/* Library */}
        <Route
          path="history"
          element={
            <PlaceholderPage title="Watch History" message="Your recently watched streams and VODs." />
          }
        />
        <Route
          path="watch-later"
          element={
            <PlaceholderPage title="Watch Later" message="Videos you saved for later." />
          }
        />
        <Route
          path="subscriptions"
          element={
            <PlaceholderPage title="Subscriptions" message="Manage your channel subscriptions." />
          }
        />
        <Route
          path="clips"
          element={
            <PlaceholderPage title="My Clips" message="Clips you created or liked." />
          }
        />

        {/* Community */}
        <Route
          path="friends"
          element={
            <PlaceholderPage title="Friends" message="See who's online and follow their activity." />
          }
        />
        <Route
          path="whispers"
          element={
            <PlaceholderPage title="Whispers" message="Private messages with other users." />
          }
        />
        <Route
          path="notifications"
          element={
            <PlaceholderPage title="Notifications" message="Alerts for follows, raids, and more." />
          }
        />

        {/* Settings */}
        <Route
          path="settings/stream"
          element={
            <PlaceholderPage title="Stream Key" message="Configure your broadcast settings." />
          }
        />
        <Route
          path="settings/chat"
          element={
            <PlaceholderPage title="Chat & Filters" message="Blocked words and chat preferences." />
          }
        />
        <Route
          path="settings/notifications"
          element={
            <PlaceholderPage title="Notifications" message="Desktop and in-app notification settings." />
          }
        />
        <Route
          path="settings/security"
          element={
            <PlaceholderPage title="Security" message="Account security and sessions." />
          }
        />

        {/* 404 – must be last */}
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="404 - Not Found"
              message="The page you're looking for doesn't exist."
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;