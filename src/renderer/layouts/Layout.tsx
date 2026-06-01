// src/layouts/Layout.tsx (modified)
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";
import { NotificationToastListener } from "../components/Shared/NotificationToastListener";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex h-screen flex-col bg-[var(--bg-base)]">
        {/* Custom title bar (only for frameless windows, but we keep it anyway) */}
        {/* <TitleBar /> */}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={sidebarOpen}
            onGoLive={() => {
              navigate("/stream-manager");
            }}
          />

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <NotificationToastListener />
      </div>
    </>
  );
};

export default Layout;
