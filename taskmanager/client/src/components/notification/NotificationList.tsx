import React, { useState } from "react";
import useNotification from "@/hooks/useNotification";
import TicketFormPreviewModal from "../tickets/TicketFormPreviewModal";

const NotificationList = () => {
  const { notifications, handleNotificationClick } = useNotification();
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
            onClick={() => {
              handleNotificationClick(notification);
              openForm(notification.ticketId);
            }}
          >
            {notification.message}
          </li>
        ))}
      </ul>

      {selectedTicketId !== null && (
        <TicketFormPreviewModal
          isOpen={!!selectedTicketId}
          ticketId={selectedTicketId}
          onClosed={closeForm}
        />
      )}
    </div>
  );
};

export default NotificationList;
