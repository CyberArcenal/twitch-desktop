// src/pages/Following/components/LoadingState.tsx
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="w-8 h-8 animate-spin text-[var(--twitch-purple)]" />
  </div>
);