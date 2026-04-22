import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";

export interface Notification {
  id: number;
  ticketId: number;
  ticketTitle: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const apiBaseUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:8080/api"
    ).replace(/\/$/, "");

    // Native EventSource cannot set Authorization header, so send token in query string.
    const streamUrl = `${apiBaseUrl}/notifications/stream?accessToken=${encodeURIComponent(accessToken)}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data) as Notification;
      setNotifications((prev) => [data, ...prev]);
    });

    eventSource.onerror = () => {
      console.error("Error with notification stream");
    };

    return () => {
      eventSource.close();
    };
  }, [accessToken]);

  const markAsRead = async (id: number) => {
    try {
      await axiosInstance.put(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axiosInstance.get<Notification[]>("/notifications/unread");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch unread notifications", error);
    }
  };

  return { notifications, markAsRead, fetchUnreadNotifications };
};

export default useNotification;
