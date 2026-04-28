import type { Ticket } from "@/hooks/useTicket";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useTickets from "@/hooks/useTicket";

interface TicketFormPreviewModalProps {
  isOpen: boolean;
  ticketId: number;
  onClosed: () => void;
}

const TicketFormPreviewModal = ({
  isOpen,
  ticketId,
  onClosed,
}: TicketFormPreviewModalProps) => {
  const { getTicketById } = useTickets();

  const [ticket, setTicket] = useState<Ticket | null>(null);

  const handleFetchTicketById = async (id: number) => {
    try {
      const data = await getTicketById(id);
      setTicket(data);
    } catch (error) {
      console.error("Failed to fetch ticket details", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleFetchTicketById(ticketId);
    }
  }, [isOpen, ticketId, getTicketById]);

  return (
    <Dialog open={isOpen} onOpenChange={onClosed}>
      <Card className="p-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
        <div className="mb-2">
          <strong>Title:</strong> {ticket?.title}
        </div>
        <div className="mb-2">
          <strong>Description:</strong> {ticket?.description}
        </div>
        <div className="mb-2">
          <strong>Status:</strong> {ticket?.status}
        </div>
        <div className="mb-2">
          <strong>Created At:</strong>{" "}
          {new Date(ticket?.createdAt ?? new Date()).toLocaleString()}
        </div>
        <div className="mb-2">
          <strong>Updated At:</strong>{" "}
          {new Date(ticket?.updatedAt ?? new Date()).toLocaleString()}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClosed}>Close</Button>
        </div>
      </Card>
    </Dialog>
  );
};

export default TicketFormPreviewModal;
