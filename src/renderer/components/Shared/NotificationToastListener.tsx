// src/components/Shared/NotificationToastListener.tsx
import { useEffect, useRef } from "react";
import { showToast } from "../../utils/notification";

type QueuedNotification = {
  title: string;
  message: string;
  type: string;
};

// Map backend notification types to toast types
const mapType = (type: string): "success" | "error" | "warning" | "info" | "critical" => {
  switch (type) {
    case "payment_confirmation":
      return "success";
    case "overdue":
      return "warning";
    case "error":
      return "error";
    case "critical":
      return "critical";
    default:
      return "info";
  }
};

export const NotificationToastListener = () => {
  const queueRef = useRef<QueuedNotification[]>([]);
  const isShowingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNext = () => {
    if (isShowingRef.current) return;
    if (queueRef.current.length === 0) return;

    const next = queueRef.current.shift();
    if (!next) return;

    isShowingRef.current = true;
    const { title, message, type } = next;

    // Show the toast
    showToast(`${title}: ${message}`, mapType(type), {
      duration: 5000,
      autoClose: true,
    });

    // After 5 seconds (or a bit more to allow animation), show next
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isShowingRef.current = false;
      showNext(); // Process next in queue
    }, 5200); // 5s + 200ms buffer
  };

  const addToQueue = (notification: QueuedNotification) => {
    queueRef.current.push(notification);
    showNext();
  };

  useEffect(() => {
    const handleNotificationCreated = (_event: any, data: any) => {
      console.log("Received notification from main process:", data);
      addToQueue({
        title: data.title,
        message: data.message,
        type: data.type,
      });
    };

    if (window.backendAPI?.on) {
      window.backendAPI.on("notification:created", handleNotificationCreated);
    }

    return () => {
      if (window.backendAPI?.off) {
        window.backendAPI.off("notification:created", handleNotificationCreated);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
};