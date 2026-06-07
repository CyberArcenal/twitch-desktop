// src/layouts/components/SidebarMenuItem.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { MenuItem } from "./SidebarMenuData";

interface SidebarMenuItemProps {
  item: MenuItem;
  isOpen: boolean;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item, isOpen }) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  // Determine if this item or any child is active
  const isActive = hasChildren
    ? (item.children?.some((child) => location.pathname === child.path) ??
      false)
    : location.pathname === item.path;

  // Dropdown open state
  const [isDropdownOpen, setIsDropdownOpen] = useState(isActive);

  // Auto-open dropdown when a child becomes active (e.g., direct navigation)
  useEffect(() => {
    if (hasChildren && isActive) {
      setIsDropdownOpen(true);
    }
  }, [hasChildren, isActive, location.pathname]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // For items with children
  if (hasChildren) {
    return (
      <li className="mb-1 w-full">
        <div
          onClick={toggleDropdown}
          className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer w-full
            ${isActive ? "bg-[var(--primary-color)] text-[var(--sidebar-text)] shadow-md" : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-[var(--sidebar-text)]"}
            ${!isOpen ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={`w-5 h-5 ${isActive ? "text-[var(--sidebar-text)]" : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text)]"}`}
            />
            {isOpen && <span className="font-medium">{item.name}</span>}
          </div>
          {isOpen && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}
                ${isActive ? "text-[var(--sidebar-text)]" : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text)]"}`}
            />
          )}
        </div>

        {/* Submenu */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isDropdownOpen ? "max-h-96" : "max-h-0"}`}
        >
          {isOpen ? (
            // Expanded mode: left border
            <ul
              className="ml-4 border-l-2 pl-3 mt-1 space-y-1"
              style={{ borderColor: "var(--primary-color)" }}
            >
              {item.children!.map((child) => {
                const isChildActive = location.pathname === child.path;
                return (
                  <li key={child.path} className="w-full">
                    <Link
                      to={child.path}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm w-full
                        ${isChildActive ? "text-[var(--sidebar-text)] bg-[var(--primary-color)]/20 font-semibold" : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-[var(--sidebar-text)]"}`}
                    >
                      <child.icon className="w-4 h-4" />
                      <span>{child.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            // Collapsed mode: centered icons with vertical line
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary-color)]"></div>
              <ul className="flex flex-col items-center space-y-1 mt-1">
                {item.children!.map((child) => {
                  const isChildActive = location.pathname === child.path;
                  return (
                    <li key={child.path} className="w-full">
                      <Link
                        to={child.path}
                        className={`group flex items-center justify-center gap-3 px-3 py-2 ml-3 rounded-lg transition-all duration-200 text-sm w-[calc(100%-12px)]
                          ${isChildActive ? "text-[var(--sidebar-text)] bg-[var(--primary-color)]/20 font-semibold" : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-[var(--sidebar-text)]"}`}
                      >
                        <child.icon className="w-4 h-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </li>
    );
  }

  // Simple item (no children)
  return (
    <li className="mb-1 w-full">
      <Link
        to={item.path}
        className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full
          ${isActive ? "bg-[var(--primary-color)] text-[var(--sidebar-text)] shadow-md" : "text-[var(--sidebar-text)] hover:bg-[var(--primary-color)] hover:text-[var(--sidebar-text)]"}
          ${!isOpen ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center gap-3">
          <item.icon
            className={`w-5 h-5 ${isActive ? "text-[var(--sidebar-text)]" : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text)]"}`}
          />
          {isOpen && <span className="font-medium">{item.name}</span>}
        </div>
        {isOpen && (
          <ChevronRight
            className={`w-4 h-4 transition-opacity duration-200 ${isActive ? "opacity-100 text-[var(--sidebar-text)]" : "opacity-0 group-hover:opacity-50 text-[var(--sidebar-text)]"}`}
          />
        )}
      </Link>
    </li>
  );
};

export default SidebarMenuItem;
