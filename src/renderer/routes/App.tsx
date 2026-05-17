// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

// Pages
import Layout from "../layouts/Layout";
import { HelpPage } from "../pages/help";
import LoginPage from "../pages/auth/login";
import Profile from "../pages/profile";
import FollowingPage from "../pages/following";
import Search from "../pages/search";
import BrowsePage from "../pages/browse";
import ChatPage from "../pages/chat";
import Followers from "../pages/followers";
import AppearanceSettings from "../pages/settings/appearance";
import ChatFiltersSettings from "../pages/settings/chat-filters";
import NotificationsSettings from "../pages/settings/notifications";
import WatchStreamPage from "../pages/stream";
import LiveDashboardPage from "../pages/Live";

// Placeholder component for stream player
const PlaceholderPage = ({ title, message }: { title: string; message?: string }) => {
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
        {message || "This feature is not yet implemented. It will be available soon."}
      </p>
      <div className="text-xs text-[#5e5e6b] bg-[#1f1f23] px-3 py-1 rounded-full">
        Route: {location}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Notify main process that renderer is ready
    if (typeof window.electronAPI?.notifyAppReady === "function") {
      window.electronAPI.notifyAppReady();
      console.log("Notified main process: renderer is ready");
    } else {
      console.log("Electron API ready (notifyAppReady not available)");
    }
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/help" element={<HelpPage />} />

      {/* Main app with layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/following" replace />} />

        {/* Core Twitch routes */}
        <Route path="following" element={<FollowingPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="followers" element={<Followers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search" element={<Search />} />
        <Route path="live" element={<LiveDashboardPage />} />
        <Route path="stream/:channel" element={<WatchStreamPage />} />
        <Route path="/profile" element={<Profile />} />

        {/* Settings */}
        <Route path="settings">
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="chat-filters" element={<ChatFiltersSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route
            index
            element={<Navigate to="/settings/appearance" replace />}
          />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<PlaceholderPage title="404 - Not Found" message="This page does not exist." />} />
      </Route>
    </Routes>
  );
}

export default App;