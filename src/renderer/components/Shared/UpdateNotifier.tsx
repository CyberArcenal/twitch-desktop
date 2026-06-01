// src/components/Shared/UpdateNotifier.tsx
import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useUpdater } from "../../hooks/useUpdater";
import UpdateModal from "./UpdateModal";

const UpdateNotifier: React.FC = () => {
  const { state, updateInfo, progress, error, downloadUpdate, installUpdate } = useUpdater();
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    if (state === "available" || state === "downloaded") {
      setShowModal(true);
    }
  }, [state]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadUpdate();
    } catch (err: any) {
      setDownloadError(err.message || "Failed to download update");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInstall = async () => {
    setInstallError(null);
    try {
      await installUpdate();
    } catch (err: any) {
      setInstallError(err.message || "Failed to install update");
    }
  };

  const getIcon = () => {
    if (state === "downloading") return <RefreshCw className="icon-sm animate-spin" />;
    return <Download className="icon-sm" />;
  };

  const getBadge = () => {
    if (state === "available") {
      return <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">!</span>;
    }
    if (state === "downloaded") {
      return <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center">✓</span>;
    }
    return null;
  };

  if (state !== "available" && state !== "downloading" && state !== "downloaded") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative p-2 rounded-lg hover:bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)] transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Update available"
      >
        {getIcon()}
        {getBadge()}
      </button>

      <UpdateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        state={state}
        updateInfo={updateInfo}
        progress={progress}
        error={error}
        downloadError={downloadError}
        installError={installError}
        isDownloading={isDownloading}
        onDownload={handleDownload}
        onInstall={handleInstall}
      />
    </>
  );
};

export default UpdateNotifier;