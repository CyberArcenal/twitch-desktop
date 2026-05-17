// src/pages/Browse/components/LoadingState.tsx
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--twitch-purple)] mx-auto mb-4" />
      <p className="text-[var(--text-secondary)]">Loading streams...</p>
    </div>
  </div>
);