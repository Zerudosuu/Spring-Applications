//AnalystDashboard allows analysts to view and manage tickets assigned to them. Analysts can update ticket statuses, add comments, and collaborate with other team members. The dashboard provides insights into ticket progress and helps analysts prioritize their work effectively.

// Analyst-specific logic can be implemented here, such as fetching assigned tickets, updating ticket statuses, etc.

// 1: Show a list of tickets assigned to the analyst, with options to update status, add comments, etc.
// 2: Provide filters to view tickets based on status (e.g., open, in progress, resolved).
// 3: Allow analysts to collaborate with other team members by adding comments or tagging users in tickets.
// 4: also to see the stats of the tickets assigned to them, such as how many are open, in progress, resolved, etc.
// 5: Also it can re assigned or pass the ticket to other analyst if they are not able to resolve it, or if they need help from other team members.

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useAuthStore from "@/store/authStore";
import useTickets, {
  type Ticket,
  type TicketRequest,
  type TicketStatus,
} from "@/hooks/useTicket";
import useUsers, { type UserRole, type UserSummary } from "@/hooks/useUsers";
import TicketList from "@/components/tickets/TicketList";
import TicketForm from "@/components/tickets/TicketForm";
import TaskSkeleton from "@/components/tasks/TaskSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  RefreshCw,
  Shield,
  Ticket as TicketIcon,
  Trash2,
  Users,
} from "lucide-react";

function AnalystDashboard() {
  const { user } = useAuthStore();
  const {
    tickets,
    isLoading: ticketsLoading,
    error: ticketsError,
    getAllTickets,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
  } = useTickets();
  const {
    users,
    isLoading: usersLoading,
    error: usersError,
    getAllUsers,
    updateUserRole,
    deleteUser,
  } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDeleteOpen, setIsTicketDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const isAnalyst = user?.role === "USER"; // Assuming "USER" role is for analysts

  const stats = useMemo(
    () => ({
      totalTickets: tickets.length,
      openTickets: tickets.filter((t) => t.status === "OPEN").length,
      activeTickets: tickets.filter((t) =>
        ["OPEN", "IN_PROGRESS"].includes(t.status),
      ).length,
      resolvedTickets: tickets.filter((t) => t.status === "RESOLVED").length,
    }),
    [tickets],
  );

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  }

  const handleTicketSubmit = async (data: TicketRequest) => {
    try {
      if (selectedTicket) {
         await updateTicket(selectedTicket.id, data); }
      else { await createTicket(data); }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  const handleTicketDeleteClick = (id: number) => { 
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) {
      setTicketToDelete(ticket);
      setIsTicketDeleteOpen(true);
    }
  }; 

  

  const handleTicketDeleteConfirm = async () => { 
    if (!ticketToDelete) {
      return;
    }
    try {
      await deleteTicket(ticketToDelete.id);
      setIsTicketDeleteOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }; 

  const ticketCards = ticketsLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          canEdit
          canDelete
          onEdit={handleEditTicket}
          onDelete={handleTicketDeleteClick}
          onStatusChange={handleTicketStatusChange}
        />
  )


  return (
    <div>
      <h1>This is Analyst dashboard</h1>
    </div>
  );
}

export default AnalystDashboard;
