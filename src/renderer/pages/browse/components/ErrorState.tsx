// src/pages/Browse/components/ErrorState.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <AlertCircle className="w-12 h-12 text-[var(--accent-red)] mb-4" />
    <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
      Something went wrong
    </p>
    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)]"
    >
      Try Again
    </button>
  </div>
);