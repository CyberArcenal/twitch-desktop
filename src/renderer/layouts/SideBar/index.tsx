// src/layouts/Sidebar.tsx – Complete refactored version
import React from "react";
import { menuItems, categories } from "./components/SidebarMenuData";
import SidebarHeader from "./components/SidebarHeader";
import SidebarFooter from "./components/SidebarFooter";
import SidebarCategorySection from "./components/SidebarCategorySection";

interface SidebarProps {
  isOpen: boolean;
  onGoLive?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  // Filter out invalid paths and empty children
  const filteredMenu = menuItems
    .map((item) => {
      if (item.children) {
        const children = item.children.filter(
          (child) => child.path !== "/users",
        );
        return { ...item, children };
      }
      return item;
    })
    .filter(
      (item) =>
        item.path !== "/users" &&
        (item.children ? item.children.length > 0 : true),
    );

  return (
    <div
      className={`
        fixed md:relative inset-y-0 left-0
        bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
        rounded-r-3xl shadow-2xl
        transform transition-all duration-300 ease-in-out
        z-30 flex flex-col h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        md:${isOpen ? "w-64" : "w-20"}
      `}
    >
      <SidebarHeader isOpen={isOpen} />

      <nav className="flex-1 overflow-y-auto sidebar-scrollbar p-4">
        {categories.map((category) => {
          const categoryItems = filteredMenu.filter(
            (item) => item.category === category.id,
          );
          if (categoryItems.length === 0) return null;

          return (
            <SidebarCategorySection
              key={category.id}
              categoryName={category.name}
              items={categoryItems}
              isOpen={isOpen}
            />
          );
        })}
      </nav>

      <SidebarFooter isOpen={isOpen} />
    </div>
  );
};

export default Sidebar;
