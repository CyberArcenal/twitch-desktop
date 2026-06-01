// src/components/Shared/UpdateModal.tsx
import React from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, X, AlertCircle, CheckCircle } from "lucide-react";
import Button from "../UI/Button";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: string;
  updateInfo: any;
  progress: any;
  error: string | null;
  downloadError: string | null;
  installError: string | null;
  isDownloading: boolean;
  onDownload: () => void;
  onInstall: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  state,
  updateInfo,
  progress,
  error,
  downloadError,
  installError,
  isDownloading,
  onDownload,
  onInstall,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--card-secondary-bg)] transition-colors"
        >
          <X className="icon-sm" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${state === "downloaded" ? "bg-green-500/20" : "bg-blue-500/20"}`}>
            {state === "downloaded" ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Download className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Update Available</h2>
            <p className={`text-xs ${state === "downloaded" ? "text-green-400" : "text-blue-400"}`}>
              {state === "available" && "New version ready to download"}
              {state === "downloading" && "Downloading update..."}
              {state === "downloaded" && "Update ready to install"}
            </p>
          </div>
        </div>

        {/* Errors */}
        {(error || downloadError || installError) && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="icon-sm text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error || downloadError || installError}</span>
          </div>
        )}

        {/* Update info */}
        {updateInfo && (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-lg font-semibold text-[var(--sidebar-text)]">v{updateInfo.version}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Released: {new Date(updateInfo.releaseDate).toLocaleDateString()}
              </p>
            </div>
            {updateInfo.releaseNotes && (
              <div className="mt-3">
                <p className="text-sm font-medium text-[var(--sidebar-text)] mb-2">What's New:</p>
                <div className="p-3 bg-[var(--card-secondary-bg)] rounded-lg max-h-64 overflow-y-auto">
                  <div className="release-notes-content text-sm text-[var(--text-secondary)] space-y-2">
                    {updateInfo.releaseNotes}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        {progress && (state === "downloading" || isDownloading) && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Downloading...</span>
              <span className="text-[var(--sidebar-text)] font-medium">{Math.round(progress.percent)}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-blue)] transition-all duration-300" style={{ width: `${progress.percent}%` }} />
            </div>
            {progress.bytesPerSecond && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{Math.round(progress.bytesPerSecond / 1024)} KB/s</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          {state === "available" && (
            <Button onClick={onDownload} disabled={isDownloading} className="btn-primary btn-sm px-5 py-2.5 flex items-center gap-2">
              {isDownloading ? <><RefreshCw className="icon-sm animate-spin" /> Downloading...</> : <><Download className="icon-sm" /> Download Update</>}
            </Button>
          )}
          {state === "downloaded" && (
            <Button onClick={onInstall} className="btn-success btn-sm px-5 py-2.5 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600">
              <RefreshCw className="icon-sm" /> Install & Restart
            </Button>
          )}
          <Button onClick={onClose} className="btn-secondary btn-sm px-5 py-2.5">Later</Button>
        </div>

        {state === "downloaded" && (
          <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">The application will restart after installation.</p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpdateModal;