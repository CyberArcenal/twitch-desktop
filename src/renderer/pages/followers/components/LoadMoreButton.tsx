// src/pages/Following/components/LoadMoreButton.tsx
import React from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface LoadMoreButtonProps {
  loading: boolean;
  onClick: () => void;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ loading, onClick }) => (
  <div className="flex justify-center mt-8 pb-6 px-6">
    <button
      onClick={onClick}
      disabled={loading}
      className="px-6 py-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Load More
          <ChevronDown className="w-4 h-4" />
        </>
      )}
    </button>
  </div>
);