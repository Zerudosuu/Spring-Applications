import { useEffect, useState } from "react";

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

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/api/notifications/stream",
      { withCredentials: true },
    );
    //TODO: Fix Stream
    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data) as Notification;
      setNotifications((prev) => [data, ...prev]);
    });

    eventSource.onerror = () => {
      console.error("Error with notification stream");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      });
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
      const response = await fetch("/api/notifications/unread");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch unread notifications", error);
    }
  };

  return { notifications, markAsRead, fetchUnreadNotifications };
};

export default useNotification;
