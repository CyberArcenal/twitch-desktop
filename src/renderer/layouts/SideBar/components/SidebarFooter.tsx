// src/layouts/components/SidebarFooter.tsx
import React from "react";
import { version, name } from "../../../../../package.json";
import UpdateNotifier from "../../../components/Shared/UpdateNotifier";
import { toTitleCase } from "../../../utils/helpers";

interface SidebarFooterProps {
  isOpen: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isOpen }) => {
  const title = toTitleCase(name);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="px-4 py-2 border-[var(--sidebar-border)] text-center flex-shrink-0">
        <UpdateNotifier />
      </div>
      <div className="p-4 border-t border-[var(--sidebar-border)] text-center flex-shrink-0 rounded-br-3xl">
        {isOpen ? (
          <p className="text-xs text-[var(--sidebar-text)] opacity-70">
            {version} • © {currentYear} {title}
          </p>
        ) : (
          <p className="text-xs text-[var(--sidebar-text)] opacity-70">
            {version}
          </p>
        )}
      </div>
    </>
  );
};

export default SidebarFooter;
