// src/layouts/components/SidebarHeader.tsx
import React from "react";
import { name } from "../../../../../package.json";
import { toTitleCase } from "../../../utils/helpers";

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isOpen }) => {
  const title = toTitleCase(name);

  return (
    <div className="flex-shrink-0 border-b border-[var(--sidebar-border)] bg-[var(--card-bg)] p-6 rounded-tr-3xl">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src="./icon.png"
            alt="Twitch Desktop Logo"
            className="h-full w-full object-cover"
          />
        </div>
        {isOpen && (
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[var(--sidebar-text)]">
              {title}
            </h2>
            <p className="text-xs text-[var(--sidebar-text)] opacity-75">
              Stream • Chat • Follow
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
