// src/pages/Following/components/EmptyState.tsx
import React from "react";
import { Tv } from "lucide-react";

export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <Tv className="w-16 h-16 text-[var(--text-tertiary)] mb-4" />
    <p className="text-[var(--text-primary)] text-lg font-medium">
      No followed channels yet
    </p>
    <p className="text-[var(--text-secondary)] text-center max-w-md mt-2">
      Follow some channels on Twitch and they will appear here.
    </p>
  </div>
);