// src/routes/App.tsx
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../layouts/Layout";
import LoginPage from "../pages/auth/login";
import FollowingPage from "../pages/following";
import DashboardPage from "../pages/dashboard";
import BrowseTopGamesPage from "../pages/browse/top-games";
import BrowseLivePage from "../pages/browse/live";
import BrowseClipsPage from "../pages/browse/clips";
import WatchHistoryPage from "../pages/history";
import WatchLaterPage from "../pages/watch-later";
import SubscriptionsPage from "../pages/subscriptions";
import FriendsPage from "../pages/friends";
import WhispersPage from "../pages/whispers";
import StreamSettingsPage from "../pages/settings/stream";
import ChatSettingsPage from "../pages/settings/chat";
import NotificationSettingsPage from "../pages/settings/notifications";
import SecuritySettingsPage from "../pages/settings/security";
import ChannelPage from "../pages/channel";
import BrowseCategoriesPage from "../pages/categories";
import HelpPage from "../pages/help";
import StreamPlayerPage from "../pages/stream";
import GamePage from "../pages/browse/game";
import StreamManagerPage from "../pages/stream-manager";
import SettingsPage from "../pages/settings";
import DiscoveryPage from "../pages/discovery";

// ─── Generic Placeholder (for pages not yet built) ─────────────
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
        <Route index element={<DiscoveryPage/>} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/stream/:login" element={<StreamPlayerPage />} />

        {/* Following */}
        <Route path="following" element={<FollowingPage />} />

        {/* Browse section */}
        <Route path="browse/categories" element={<BrowseCategoriesPage />} />
        <Route path="browse/top-games" element={<BrowseTopGamesPage />} />
        <Route path="browse/live" element={<BrowseLivePage />} />
        <Route path="browse/clips" element={<BrowseClipsPage />} />

        {/* Library section */}
        <Route path="history" element={<WatchHistoryPage />} />
        <Route path="watch-later" element={<WatchLaterPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        {/* My Clips – not yet built */}
        <Route
          path="clips"
          element={
            <PlaceholderPage
              title="My Clips"
              message="Clips you created or liked."
            />
          }
        />

        {/* Community section */}
        <Route path="friends" element={<FriendsPage />} />
        <Route path="whispers" element={<WhispersPage />} />
        {/* Community Notifications – not yet built */}
        <Route
          path="notifications"
          element={
            <PlaceholderPage
              title="Notifications"
              message="Alerts for follows, raids, and more."
            />
          }
        />

        {/* Settings section */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Channel page */}
        <Route path="/channel/:login" element={<ChannelPage />} />
        <Route path="browse/game/:gameId" element={<GamePage />} />
        <Route path="/stream-manager" element={<StreamManagerPage />} />

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
