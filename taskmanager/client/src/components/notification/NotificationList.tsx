import React, { useState } from "react";
import type { Notification } from "@/hooks/useNotification";
import TicketFormPreviewModal from "../tickets/TicketFormPreviewModal";

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => Promise<void> | void;
}

const NotificationList = ({
  notifications,
  onNotificationClick,
}: NotificationListProps) => {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const openForm = (ticketId: number) => {
    setSelectedTicketId(ticketId);
  };

  const closeForm = () => {
    setSelectedTicketId(null);
  };

  return (
    <div>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              openForm(notification.ticketId);
              onNotificationClick(notification);
            }}
          >
            <p className="font-medium text-gray-800">
              {notification.ticketTitle}
            </p>
            <p className="text-gray-600">{notification.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      {/* {selectedTicketId !== null && (
        <TicketFormPreviewModal
          isOpen={!!selectedTicketId}
          ticketId={selectedTicketId}
          onClosed={closeForm}
        />
      )} */}
    </div>
  );
};

export default NotificationList;
