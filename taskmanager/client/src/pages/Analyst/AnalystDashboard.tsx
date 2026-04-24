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
import useUsers from "@/hooks/useUsers";
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
    updateTicket,
    getAssignedTickets,
    updateTicketStatus,
  } = useTickets();

  const { users, getAssignableUsers } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const loadAnalystData = useCallback(async () => {
    await Promise.all([getAssignedTickets(), getAssignableUsers()]);
  }, [getAssignedTickets, getAssignableUsers]);

  useEffect(() => {
    loadAnalystData();
  }, [loadAnalystData]);

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleTicketSubmit = async (data: TicketRequest) => {
    if (!selectedTicket) return;
    await updateTicket(selectedTicket.id, data);

    await getAssignedTickets();
    setIsFormOpen(false);
  };

  const handleTicketStatusChange = useCallback(
    (id: number, status: TicketStatus) => {
      updateTicketStatus(id, status);
      getAssignedTickets(); // Refresh the list after status change
    },
    [updateTicketStatus, getAssignedTickets],
  );

  const ticketCards = ticketsLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <TaskSkeleton key={index} />
      ))}
    </div>
  ) : (
    <TicketList
      tickets={tickets}
      canEdit={isAnalyst}
      onEdit={handleEditTicket}
      onStatusChange={handleTicketStatusChange}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Shield className="h-4 w-4" />
            Analyst Dashboard
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Manage tickets
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View all tickets, reassign work, and update ticket statuses to keep
            the workflow moving smoothly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadAnalystData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalTickets}
            </p>
            <p className="text-sm text-gray-500">Total tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.activeTickets}
            </p>
            <p className="text-sm text-gray-500">Active tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.openTickets}
            </p>
            <p className="text-sm text-gray-500">Open tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.resolvedTickets}
            </p>
            <p className="text-sm text-gray-500">Resolved tickets</p>
          </CardContent>
        </Card>
      </div>

      {ticketsError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {ticketsError}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
            <p className="text-sm text-gray-500">
              Edit, reassign, resolve and change ticket status from here.
            </p>
          </div>
        </div>

        {ticketCards}

        <TicketForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleTicketSubmit}
          ticket={selectedTicket}
          assignees={users}
        />
      </div>

      {/* <AlertDialog
        open={isTicketDeleteOpen}
        onOpenChange={setIsTicketDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ticketToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await handleTicketDeleteConfirm();
                setIsTicketDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}

export default AnalystDashboard;
