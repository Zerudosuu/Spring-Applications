//TriageDasboard allows triage team members to view and manage incoming tickets. They can categorize tickets, assign them to the appropriate teams, and update ticket statuses. The dashboard provides an overview of the ticket queue and helps triage members prioritize their work efficiently.

// Triage-specific logic can be implemented here, such as fetching incoming tickets, categorizing them, assigning to teams, etc.

// 1: Show a list of incoming tickets that need triage, with options to categorize, assign to teams, etc.

import useTickets, {
  type Ticket,
  type TicketRequest,
  type TicketStatus,
} from "@/hooks/useTicket";
import { useCallback, useEffect, useMemo, useState } from "react";
import useUsers from "@/hooks/useUsers";
import TicketList from "@/components/tickets/TicketList";
import TicketForm from "@/components/tickets/TicketForm";
import TaskSkeleton from "@/components/tasks/TaskSkeleton";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import { Plus, RefreshCw, Shield } from "lucide-react";

function TriageDashboard() {
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

  const { users, getAssignableUsers } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDeleteOpen, setIsTicketDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    }),
    [tickets],
  );

  //functions

  const handleCreateNewTicket = () => {
    setSelectedTicket(null);
    setIsFormOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleTicketSubmit = async (data: TicketRequest) => {
    if (selectedTicket) {
      await updateTicket(selectedTicket.id, data);
    } else {
      await createTicket(data);
    }

    await getAllTickets();
    setIsFormOpen(false);
  };

  const handleTicketDeleteClick = (id: number) => {
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) {
      setTicketToDelete(ticket);
      setIsTicketDeleteOpen(true);
    }
  };

  const handleTicketDeleteConfirm = async () => {
    if (!ticketToDelete) return;

    await deleteTicket(ticketToDelete.id);
    await getAllTickets();
    setIsTicketDeleteOpen(false);
    setTicketToDelete(null);
  };

  const handleTicketStatusChange = async (
    ticketId: number,
    newStatus: TicketStatus,
  ) => {
    await updateTicketStatus(ticketId, newStatus);
    await getAllTickets();
  };

  const loadTicketData = useCallback(async () => {
    await Promise.all([getAllTickets(), getAssignableUsers()]);
  }, [getAllTickets, getAssignableUsers]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

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
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Shield className="h-4 w-4" />
            Triage Dashboard
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
          <Button variant="outline" onClick={loadTicketData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
            <p className="text-sm text-gray-500">Active tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.open}</p>
            <p className="text-sm text-gray-500">Open tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.closed}</p>
            <p className="text-sm text-gray-500">Closed tickets</p>
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
              Edit, reassign, and change ticket status from here.
            </p>
          </div>

          <Button onClick={handleCreateNewTicket}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
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

      <AlertDialog
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
      </AlertDialog>
    </div>
  );
}

export default TriageDashboard;
