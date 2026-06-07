// src/layouts/components/SidebarCategorySection.tsx
import React from "react";
import SidebarMenuItem from "./SidebarMenuItem";
import type { MenuItem } from "./SidebarMenuData";

interface SidebarCategorySectionProps {
  categoryName: string;
  items: MenuItem[];
  isOpen: boolean;
}

const SidebarCategorySection: React.FC<SidebarCategorySectionProps> = ({
  categoryName,
  items,
  isOpen,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      {isOpen && (
        <h6 className="px-4 py-2 text-xs font-semibold text-[var(--sidebar-text)] uppercase tracking-wider">
          {categoryName}
        </h6>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem
            key={item.path || item.name}
            item={item}
            isOpen={isOpen}
          />
        ))}
      </ul>
    </div>
  );
};

export default SidebarCategorySection;
