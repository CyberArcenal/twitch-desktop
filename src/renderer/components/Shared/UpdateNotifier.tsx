// src/components/Shared/UpdateNotifier.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, X, AlertCircle, CheckCircle } from "lucide-react";
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
    setState,
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
        return <RefreshCw className="icon-sm animate-spin" />;
      default:
        return <Download className="icon-sm" />;
    }
  };

  const getBadge = () => {
    if (state === "available") {
      return (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
          !
        </span>
      );
    }
    if (state === "downloaded") {
      return (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center">
          ✓
        </span>
      );
    }
    return null;
  };

  const getStatusInfo = () => {
    switch (state) {
      case "available":
        return {
          message: "New version ready to download",
          color: "text-blue-400",
        };
      case "downloading":
        return { message: "Downloading update...", color: "text-blue-400" };
      case "downloaded":
        return { message: "Update ready to install", color: "text-green-400" };
      default:
        return { message: "", color: "" };
    }
  };

  const statusInfo = getStatusInfo();

  const renderReleaseNotes = () => {
    if (!updateInfo?.releaseNotes) return null;
    const notes = updateInfo.releaseNotes;
    const isHtml = /<[a-z][\s\S]*>/i.test(notes);
    if (isHtml) {
      return (
        <div
          className="release-notes-content text-sm text-[var(--text-secondary)] space-y-2"
          dangerouslySetInnerHTML={{ __html: notes }}
        />
      );
    }
    return (
      <pre className="text-xs whitespace-pre-wrap font-sans text-[var(--text-secondary)]">
        {notes}
      </pre>
    );
  };

  const modalContent = showModal ? (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowModal(false);
      }}
    >
      <div
        className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--card-secondary-bg)] transition-colors"
          aria-label="Close"
        >
          <X className="icon-sm" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              state === "downloaded" ? "bg-green-500/20" : "bg-blue-500/20"
            }`}
          >
            {state === "downloaded" ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Download className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">
              Update Available
            </h2>
            <p className={`text-xs ${statusInfo.color}`}>
              {statusInfo.message}
            </p>
          </div>
        </div>

        {(error || downloadError || installError) && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="icon-sm text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">
              {error || downloadError || installError}
            </span>
          </div>
        )}

        {updateInfo && (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-lg font-semibold text-[var(--sidebar-text)]">
                v{updateInfo.version}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Released:{" "}
                {new Date(updateInfo.releaseDate).toLocaleDateString()}
              </p>
            </div>
            {updateInfo.releaseNotes && (
              <div className="mt-3">
                <p className="text-sm font-medium text-[var(--sidebar-text)] mb-2">
                  What's New:
                </p>
                <div className="p-3 bg-[var(--card-secondary-bg)] rounded-lg max-h-64 overflow-y-auto custom-scrollbar">
                  {renderReleaseNotes()}
                </div>
              </div>
            )}
          </div>
        )}

        {progress && (state === "downloading" || isDownloading) && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">
                Downloading...
              </span>
              <span className="text-[var(--sidebar-text)] font-medium">
                {Math.round(progress.percent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-blue)] transition-all duration-300 ease-out rounded-full"
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

        <div className="flex gap-3 justify-end mt-6">
          {(state === "available" || state === "downloading") && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary btn-sm px-5 py-2.5 flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "downloading" ? (
                <>
                  <RefreshCw className="icon-sm animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="icon-sm" />
                  Download Update
                </>
              )}
            </Button>
          )}
          {state === "downloaded" && (
            <Button
              onClick={handleInstall}
              className="btn-success btn-sm px-5 py-2.5 flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600"
            >
              <RefreshCw className="icon-sm" />
              Install & Restart
            </Button>
          )}
          <Button
            onClick={() => setShowModal(false)}
            className="btn-secondary btn-sm px-5 py-2.5 font-medium"
          >
            Later
          </Button>
        </div>
        {state === "downloaded" && (
          <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
            The application will restart after installation.
          </p>
        )}
      </div>
    </div>
  ) : null;

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
      {typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
};

export default UpdateNotifier;
