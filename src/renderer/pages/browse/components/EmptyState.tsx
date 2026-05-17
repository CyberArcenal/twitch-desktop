// src/pages/Browse/components/EmptyState.tsx
import React from "react";
import { Tv } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <Tv className="w-16 h-16 text-[var(--text-tertiary)] mb-4" />
    <p className="text-[var(--text-primary)] text-lg font-medium">
      No streams found
    </p>
    <p className="text-[var(--text-secondary)] text-center max-w-md mt-2">
      {searchQuery
        ? `No streams match "${searchQuery}"`
        : "No streams available at the moment"}
    </p>
  </div>
);