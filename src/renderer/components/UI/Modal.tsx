import React, { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { dialogs } from "../../utils/dialogs";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  minHeight?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
  blur?: boolean;
  safetyClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  minHeight = "min-h-[200px]",
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  preventScroll = true,
  blur = false,
  safetyClose = false,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(async () => {
    if (safetyClose) {
      const confirmed = await dialogs.confirm({
        title: "Close",
        message: "Are you sure you want to close this dialog?",
      });
      if (!confirmed) return;
    }
    setIsAnimatingOut(true);
    setTimeout(() => {
      setShouldRender(false);
      setIsAnimatingOut(false);
      onClose();
    }, 200);
  }, [safetyClose, onClose]);

  // ✅ Kapag nagbago ang isOpen mula sa labas (e.g., parent set to false)
  useEffect(() => {
    if (!isOpen && shouldRender) {
      // Pwersahang i-reset ang modal nang walang animation
      setShouldRender(false);
      setIsAnimatingOut(false);
    }
  }, [isOpen, shouldRender]);

  // ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeOnEsc, handleClose]);

  // Body scroll lock
  useEffect(() => {
    if (!preventScroll) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, preventScroll]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!shouldRender || isAnimatingOut) return;
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!focusableElements?.length) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
      if (firstElement) {
        firstElement.focus();
      } else {
        modalRef.current.focus();
      }
    }

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [shouldRender, isAnimatingOut]);

  // Restore focus
  useEffect(() => {
    if (!shouldRender && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [shouldRender]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-all duration-200 ${
          blur ? "backdrop-blur-sm" : "bg-black/50"
        } ${isAnimatingOut ? "opacity-0" : "opacity-100"}`}
        onClick={closeOnClickOutside ? handleClose : undefined}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`relative w-full ${sizeClasses[size]} ${minHeight} transform rounded-xl bg-[var(--card-bg)] shadow-2xl transition-all duration-200 ${
            isAnimatingOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-[var(--sidebar-text)]"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="rounded-md p-1.5 hover:bg-[var(--card-secondary-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 text-[var(--sidebar-text)]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-end gap-3 px-6 py-4 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;