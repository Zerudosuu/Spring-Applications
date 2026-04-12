import { type Ticket, type TicketStatus } from "@/hooks/useTicket";
import TicketCard from "./TicketCard";
import { ClipboardList } from "lucide-react";

interface TicketListProps {
  tickets: Ticket[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TicketStatus) => void;
}

function TicketList({
  tickets,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onStatusChange,
}: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 text-lg font-medium">No tickets found</p>
        <p className="text-gray-300 text-sm mt-1">Try switching tabs or create a new ticket.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

export default TicketList;
