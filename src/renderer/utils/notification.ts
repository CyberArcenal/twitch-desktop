// src/utils/notification.ts
interface NotificationOptions {
  duration?: number;
  autoClose?: boolean;
  swipeClose?: boolean;
  showClose?: boolean;
}

type NotificationType = "success" | "error" | "warning" | "info" | "critical";

interface ApiErrorResponse {
  status?: number;
  statusText?: string;
  data?: any;
}

interface ApiError extends Error {
  response?: ApiErrorResponse;
}

class NotificationManager {
  private toastContainer: HTMLElement | null;
  private bannerContainer: HTMLElement | null;
  private loadingOverlay: HTMLElement | null;
  private nextToastId: number;

  constructor() {
    this.toastContainer = null;
    this.bannerContainer = null;
    this.loadingOverlay = null;
    this.nextToastId = 1;
    this.initContainers();
  }

  private initContainers(): void {
    // Remove existing containers if they exist
    if (this.toastContainer) this.toastContainer.remove();
    if (this.bannerContainer) this.bannerContainer.remove();
    if (this.loadingOverlay) this.loadingOverlay.remove();

    // Create toast container at bottom-right
    this.toastContainer = document.createElement("div");
    this.toastContainer.id = "toast-container";
    this.toastContainer.className =
      "fixed bottom-4 right-4 z-[9999] flex flex-col items-end space-y-3 pointer-events-none";
    document.body.appendChild(this.toastContainer);

    // Create banner container (below navigation)
    this.bannerContainer = document.createElement("div");
    this.bannerContainer.id = "banner-container";
    this.bannerContainer.className = "fixed top-16 left-0 right-0 z-[9998]";
    document.body.appendChild(this.bannerContainer);

    // Create loading overlay
    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.id = "loading-overlay";
    this.loadingOverlay.className =
      "fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center hidden";
    this.loadingOverlay.innerHTML = `
      <div class="bg-[var(--card-bg)] rounded-xl p-6 w-64 text-center shadow-2xl border border-[var(--border-color)]">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-[var(--text-primary)] font-medium">Processing request...</p>
      </div>
    `;
    document.body.appendChild(this.loadingOverlay);
  }

  private getIcon(type: NotificationType): string {
    const icons = {
      success: `
        <svg class="h-5 w-5 text-[var(--success-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      error: `
        <svg class="h-5 w-5 text-[var(--danger-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      warning: `
        <svg class="h-5 w-5 text-[var(--warning-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      `,
      info: `
        <svg class="h-5 w-5 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      `,
      critical: `
        <svg class="h-5 w-5 text-[var(--danger-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01"/>
        </svg>
      `,
    };
    return icons[type] || icons.info;
  }

  private getToastClasses(type: NotificationType): string {
    const baseClasses = `
      w-80 max-w-sm rounded-xl shadow-lg p-3 flex items-start pointer-events-auto
      bg-[var(--card-bg)] border-l-4 animate-slideInRight
    `;
    const typeClasses = {
      success: "border-[var(--success-color)]",
      error: "border-[var(--danger-color)]",
      warning: "border-[var(--warning-color)]",
      info: "border-[var(--accent-blue)]",
      critical: "border-[var(--danger-color)]",
    };
    return `${baseClasses} ${typeClasses[type]}`;
  }

  private getBannerClasses(type: NotificationType): string {
    const baseClasses =
      "w-full py-3 px-4 shadow-md border-b-2 animate-slideInTop";
    const typeClasses = {
      success: "bg-[var(--status-completed-bg)] border-[var(--success-color)] text-[var(--text-primary)]",
      error: "bg-[var(--status-cancelled-bg)] border-[var(--danger-color)] text-[var(--text-primary)]",
      warning: "bg-[var(--status-pending-bg)] border-[var(--warning-color)] text-[var(--text-primary)]",
      info: "bg-[var(--status-processing-bg)] border-[var(--accent-blue)] text-[var(--text-primary)]",
      critical: "bg-[var(--status-cancelled-bg)] border-[var(--danger-color)] text-[var(--text-primary)]",
    };
    return `${baseClasses} ${typeClasses[type]}`;
  }

  public showToast(
    message: string,
    type: NotificationType = "info",
    options: NotificationOptions = {}
  ): HTMLElement {
    const toastId = `toast-${this.nextToastId++}`;
    const defaultOptions: NotificationOptions = {
      duration: 5000,
      autoClose: true,
      swipeClose: true,
      showClose: true,
      ...options,
    };

    const toast = document.createElement("div");
    toast.id = toastId;
    toast.className = this.getToastClasses(type);
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    toast.innerHTML = `
      <div class="flex-shrink-0 mr-3">
        ${this.getIcon(type)}
      </div>
      <div class="flex-1 text-sm font-medium text-[var(--text-primary)] break-words">
        ${this.escapeHtml(message)}
      </div>
      <button class="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-200 flex-shrink-0">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;

    this.toastContainer?.appendChild(toast);

    // Add close button handler
    const closeBtn = toast.querySelector("button");
    closeBtn?.addEventListener("click", () => this.removeToast(toast));

    // Auto-close if enabled
    if (defaultOptions.autoClose && defaultOptions.duration && defaultOptions.duration > 0) {
      setTimeout(() => this.removeToast(toast), defaultOptions.duration);
    }

    // Swipe close if enabled
    if (defaultOptions.swipeClose) {
      this.addSwipeClose(toast);
    }

    return toast;
  }

  private escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  public removeToast(toastElement: HTMLElement): void {
    if (toastElement) {
      toastElement.classList.remove("animate-slideInRight");
      toastElement.classList.add("animate-slideOutRight");
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, 300);
    }
  }

  private addSwipeClose(toast: HTMLElement): void {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      toast.style.transition = "none";
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (diff > 0) {
        toast.style.transform = `translateX(${diff}px)`;
        toast.style.opacity = `${1 - diff / toast.offsetWidth}`;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      toast.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      const diff = currentX - startX;
      if (diff > toast.offsetWidth / 2) {
        this.removeToast(toast);
      } else {
        toast.style.transform = "";
        toast.style.opacity = "";
      }
    };

    toast.addEventListener("touchstart", onTouchStart);
    toast.addEventListener("touchmove", onTouchMove);
    toast.addEventListener("touchend", onTouchEnd);
  }

  public showLoading(message = "Processing request..."): void {
    const textElement = this.loadingOverlay?.querySelector("p");
    if (textElement) textElement.textContent = message;
    this.loadingOverlay?.classList.remove("hidden");
  }

  public hideLoading(): void {
    this.loadingOverlay?.classList.add("hidden");
  }

  public createBanner(
    message: string,
    type: NotificationType = "info",
    options: NotificationOptions = {}
  ): HTMLElement {
    const existingBanner = this.bannerContainer?.querySelector(".banner");
    if (existingBanner) existingBanner.remove();

    const defaultOptions: NotificationOptions = {
      duration: 0,
      autoClose: false,
      showClose: true,
      ...options,
    };

    const banner = document.createElement("div");
    banner.className = `banner ${this.getBannerClasses(type)}`;
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");

    const closeButton = defaultOptions.showClose
      ? `<button class="text-current hover:opacity-70 ml-2 transition-opacity duration-200 flex-shrink-0">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
        </button>`
      : "";

    banner.innerHTML = `
      <div class="container mx-auto px-4 flex items-center justify-center">
        <div class="mr-3 flex-shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="flex-1 text-sm font-medium">
          ${this.escapeHtml(message)}
        </div>
        ${closeButton}
      </div>
    `;

    this.bannerContainer?.appendChild(banner);

    if (defaultOptions.showClose) {
      const closeBtn = banner.querySelector("button");
      closeBtn?.addEventListener("click", () => this.removeBanner(banner));
    }

    if (defaultOptions.autoClose && defaultOptions.duration && defaultOptions.duration > 0) {
      setTimeout(() => this.removeBanner(banner), defaultOptions.duration);
    }

    return banner;
  }

  public removeBanner(bannerElement: HTMLElement): void {
    if (bannerElement) {
      bannerElement.classList.remove("animate-slideInTop");
      bannerElement.classList.add("animate-slideOutTop");
      setTimeout(() => {
        if (bannerElement.parentNode) {
          bannerElement.parentNode.removeChild(bannerElement);
        }
      }, 300);
    }
  }
}

// Singleton instance
const notificationManager = new NotificationManager();

// Add global styles for animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  @keyframes slideInTop {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideOutTop {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-100%); opacity: 0; }
  }
  .animate-slideInRight {
    animation: slideInRight 0.3s forwards;
  }
  .animate-slideOutRight {
    animation: slideOutRight 0.3s forwards;
  }
  .animate-slideInTop {
    animation: slideInTop 0.3s forwards;
  }
  .animate-slideOutTop {
    animation: slideOutTop 0.3s forwards;
  }
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top: 3px solid var(--success-color);
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Export functions (unchanged)
export const showToast = (
  message: string,
  type: NotificationType = "info",
  options: NotificationOptions = {}
): HTMLElement => notificationManager.showToast(message, type, options);

export const showSuccess = (message: string, options?: NotificationOptions): HTMLElement =>
  showToast(message, "success", options);

export const showError = (message: string, options?: NotificationOptions): HTMLElement =>
  showToast(message, "error", options);

export const showWarning = (message: string, options?: NotificationOptions): HTMLElement =>
  showToast(message, "warning", options);

export const showInfo = (message: string, options?: NotificationOptions): HTMLElement =>
  showToast(message, "info", options);

export const showCritical = (message: string, options?: NotificationOptions): HTMLElement =>
  showToast(message, "critical", options);

export const showLoading = (message?: string): void => notificationManager.showLoading(message);
export const hideLoading = (): void => notificationManager.hideLoading();

export const showBanner = (
  message: string,
  type: NotificationType = "info",
  options: NotificationOptions = {}
): HTMLElement => notificationManager.createBanner(message, type, options);

export const showCriticalBanner = (message: string, options?: NotificationOptions): HTMLElement =>
  showBanner(message, "critical", options);

// Error handling functions remain unchanged
export const extractErrorMessage = (error: ApiError): string => {
  if (!error.response) return "Network error. Please check your connection.";
  const response = error.response;
  const data = response.data;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data.map((item) => (typeof item === "string" ? item : item.string || JSON.stringify(item))).join(". ");
  }
  if (typeof data === "object" && data !== null) {
    if (data.detail) return typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    if (data.error) {
      const err = data.error;
      return typeof err === "string" ? err : Array.isArray(err) ? err.map((e) => e.string || e).join(". ") : JSON.stringify(err);
    }
    if (data.message) return data.message;
    if (data.errors && Array.isArray(data.errors)) return data.errors.join(". ");
    const messages: string[] = [];
    Object.values(data).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "object" && item !== null && "string" in item) messages.push(item.string);
          else if (typeof item === "string") messages.push(item);
          else messages.push(JSON.stringify(item));
        });
      } else if (typeof value === "string") messages.push(value);
      else if (typeof value === "object" && value !== null && "string" in value) messages.push((value as any).string);
      else messages.push(JSON.stringify(value));
    });
    if (messages.length > 0) return messages.join(". ");
  }
  return response.statusText || `Request failed with status ${response.status}`;
};

export const showApiError = (
  error: unknown,
  fallback: string = "",
  options: NotificationOptions = {}
): void => {
  let message = "An unexpected error occurred";
  let status: number | undefined;
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, any>;
    if (err.response) {
      status = err.response.status;
      message = extractErrorMessage(err as ApiError);
    } else if (err.status) {
      status = err.status;
      if (err.data) message = extractErrorMessage({ response: { data: err.data, status: err.status } } as ApiError);
      else message = err.message || fallback;
    } else if (err.message) message = err.message;
    else if (err.detail || err.error || err.message) message = extractErrorMessage({ response: { data: error } } as ApiError);
  } else if (typeof error === "string") message = error;
  let type: NotificationType = "error";
  if (status === 401 || status === 403 || (status && status >= 500)) type = "critical";
  if (status === 404) type = "warning";
  showToast(message, type, { duration: 7000, autoClose: true, ...options });
};

export const inventoryNotifications = {
  productCreated: (productName: string) => showSuccess(`Product "${productName}" created successfully`),
  productUpdated: (productName: string) => showSuccess(`Product "${productName}" updated successfully`),
  productDeleted: (productName: string) => showSuccess(`Product "${productName}" deleted successfully`),
  lowStockWarning: (productName: string, quantity: number) => showWarning(`Low stock alert: "${productName}" has only ${quantity} units left`),
  outOfStock: (productName: string) => showError(`Out of stock: "${productName}" is no longer available`),
  orderCreated: (orderId: string) => showSuccess(`Order #${orderId} created successfully`),
  orderUpdated: (orderId: string) => showSuccess(`Order #${orderId} updated successfully`),
  orderCompleted: (orderId: string) => showSuccess(`Order #${orderId} marked as completed`),
  purchaseCreated: (purchaseId: string) => showSuccess(`Purchase order #${purchaseId} created successfully`),
  purchaseReceived: (purchaseId: string) => showSuccess(`Purchase order #${purchaseId} received and stock updated`),
  dataExported: (format: string) => showSuccess(`${format.toUpperCase()} export completed successfully`),
  backupCreated: () => showSuccess("Database backup created successfully"),
  settingsUpdated: () => showSuccess("Settings updated successfully"),
};