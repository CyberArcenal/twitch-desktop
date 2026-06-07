// src/components/Shared/UpdateNotifier.tsx – Enhanced for Sidebar
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, X, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useUpdater } from "../../hooks/useUpdater";
import Button from "../UI/Button";

const UpdateNotifier: React.FC = () => {
  const {
    state,
    updateInfo,
    progress,
    error,
    downloadUpdate,
    installUpdate,
  } = useUpdater();
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      setDownloadError(null);
      setInstallError(null);
    }
  }, [showModal]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadUpdate();
    } catch (err: any) {
      setDownloadError(err.message || "Failed to start download");
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInstallError(null);
    try {
      await installUpdate();
    } catch (err: any) {
      setInstallError(err.message || "Failed to install update");
    }
  };

  if (!["available", "downloading", "downloaded", "error"].includes(state)) {
    return null;
  }

  const getIcon = () => {
    switch (state) {
      case "downloading":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "downloaded":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getBadge = () => {
    if (state === "available") {
      return (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-md" />
      );
    }
    if (state === "downloaded") {
      return (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-md" />
      );
    }
    return null;
  };

  const getStatusText = () => {
    switch (state) {
      case "available": return "Update available";
      case "downloading": return "Downloading update...";
      case "downloaded": return "Ready to install!";
      default: return "";
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case "available": return "text-[#9146ff]";
      case "downloading": return "text-blue-400";
      case "downloaded": return "text-green-400";
      default: return "text-[var(--text-secondary)]";
    }
  };

  const modalContent = showModal ? (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowModal(false);
      }}
    >
      <div
        className="bg-[var(--card-bg)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border-color)] overflow-hidden animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-3 border-b border-[var(--border-color)] bg-gradient-to-r from-[#18181b] to-[#1f1f23]">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              state === "downloaded" ? "bg-green-500/20" : "bg-[#9146ff]/20"
            }`}>
              {state === "downloaded" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#9146ff]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Update Available</h2>
              <p className={`text-xs ${getStatusColor()}`}>{getStatusText()}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {(error || downloadError || installError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{error || downloadError || installError}</span>
            </div>
          )}

          {updateInfo && (
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-lg font-bold text-[var(--sidebar-text)]">v{updateInfo.version}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {new Date(updateInfo.releaseDate).toLocaleDateString()}
                </p>
              </div>
              {updateInfo.releaseNotes && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-[var(--sidebar-text)] mb-2">What's New:</p>
                  <div className="p-3 bg-[var(--card-secondary-bg)] rounded-xl max-h-64 overflow-y-auto custom-scrollbar text-sm text-[var(--text-secondary)]">
                    {updateInfo.releaseNotes.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{updateInfo.releaseNotes}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {progress && (state === "downloading" || isDownloading) && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">Downloading...</span>
                <span className="text-[var(--sidebar-text)] font-medium">{Math.round(progress.percent)}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9146ff] to-[#a970ff] transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              {progress.bytesPerSecond && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {Math.round(progress.bytesPerSecond / 1024)} KB/s
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 bg-[#18181b] border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3 justify-end">
          {(state === "available" || state === "downloading") && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              {state === "downloading" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Update
                </>
              )}
            </Button>
          )}
          {state === "downloaded" && (
            <Button
              onClick={handleInstall}
              variant="success"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Install & Restart
            </Button>
          )}
          <Button
            onClick={() => setShowModal(false)}
            variant="secondary"
            size="sm"
          >
            Later
          </Button>
        </div>

        {state === "downloaded" && (
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              The application will restart after installation.
            </p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative group w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--sidebar-text)] transition-all duration-200 hover:scale-[1.02] active:scale-95"
        aria-label="Update available"
        title={getStatusText()}
      >
        {getIcon()}
        <span className="text-xs font-medium hidden md:inline-block">
          {state === "available" && "Update"}
          {state === "downloading" && `${Math.round(progress?.percent || 0)}%`}
          {state === "downloaded" && "Restart"}
        </span>
        {getBadge()}
      </button>
      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
};

export default UpdateNotifier;