import { type Ticket, type TicketStatus } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";

const priorityColors: Record<Ticket["priority"], string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const statusColors: Record<Ticket["status"], string> = {
  OPEN: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-200 text-slate-700",
  REOPENED: "bg-amber-100 text-amber-700",
  CANCELED: "bg-red-100 text-red-700",
};

interface TicketCardProps {
  ticket: Ticket;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TicketStatus) => void;
}

function toReadableStatus(status: TicketStatus) {
  return status.replace("_", " ");
}

function TicketCard({
  ticket,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onStatusChange,
}: TicketCardProps) {
  const canMoveToInProgress = ["OPEN", "REOPENED"].includes(ticket.status);
  const canMoveToResolved = ticket.status === "IN_PROGRESS";
  const canMoveToClosed = ticket.status === "RESOLVED";

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 flex-1">{ticket.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[ticket.priority]}`}
        >
          {ticket.priority}
        </span>
      </div>

      {ticket.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[ticket.status]}`}
        >
          {toReadableStatus(ticket.status)}
        </span>
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-700">
          {ticket.category}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1 mb-3">
        <p>Reporter: {ticket.reporterName}</p>
        <p>Assignee: {ticket.assigneeName}</p>
        <p>Due: {new Date(ticket.dueDate).toLocaleDateString()}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {canMoveToInProgress && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(ticket.id, "IN_PROGRESS")}>
            Start
          </Button>
        )}
        {canMoveToResolved && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(ticket.id, "RESOLVED")}>
            Resolve
          </Button>
        )}
        {canMoveToClosed && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(ticket.id, "CLOSED")}>
            Close
          </Button>
        )}
        {ticket.status === "CLOSED" && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(ticket.id, "REOPENED")}>
            Reopen
          </Button>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(ticket)}>
            Edit
          </Button>
        )}
        {canDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(ticket.id)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default TicketCard;
