import { useCallback, useEffect, useState } from "react";
import useTickets, {
  type Ticket,
  type TicketRequest,
  type TicketStatus,
} from "@/hooks/useTicket";
import TicketList from "@/components/tickets/TicketList";
import TicketForm from "@/components/tickets/TicketForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskSkeleton from "@/components/tasks/TaskSkeleton";
import useAuthStore from "@/store/authStore";
import useUsers from "@/hooks/useUsers";
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

function DashboardPage() {
  const { user } = useAuthStore();
  const {
    tickets,
    isLoading,
    error,
    getAssignedTickets,
    getReportedTickets,
    getAllTickets,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
  } = useTickets();
  const {
    users: assignees,
    error: usersError,
    getAssignableUsers,
  } = useUsers();

  type TicketTab = "ASSIGNED" | "REPORTED" | "ALL";

  const [activeTab, setActiveTab] = useState<TicketTab>("ASSIGNED");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const canCreateTicket = user?.role === "TRIAGE" || user?.role === "ADMIN";
  const canSeeAllTab = user?.role === "ADMIN";
  const canDeleteTicket = user?.role === "ADMIN";

  const loadTicketsByTab = useCallback(
    async (tab: TicketTab) => {
      if (tab === "ASSIGNED") {
        await getAssignedTickets();
        return;
      }

      if (tab === "REPORTED") {
        await getReportedTickets();
        return;
      }

      if (canSeeAllTab) {
        await getAllTickets();
      }
    },
    [canSeeAllTab, getAllTickets, getAssignedTickets, getReportedTickets],
  );

  useEffect(() => {
    loadTicketsByTab(activeTab);
  }, [activeTab, loadTicketsByTab]);

  useEffect(() => {
    if (canCreateTicket) {
      getAssignableUsers();
    }
  }, [canCreateTicket, getAssignableUsers]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const handleCreateNew = () => {
    setSelectedTicket(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    const ticket = tickets.find((t) => t.id === id);
    if (ticket) {
      setTicketToDelete(ticket);
      setIsDeleteOpen(true);
    }
  };

  const handleFormSubmit = async (data: TicketRequest) => {
    if (selectedTicket) {
      await updateTicket(selectedTicket.id, data);
    } else {
      await createTicket(data);
    }

    await loadTicketsByTab(activeTab);
  };

  const handleDeleteConfirm = async () => {
    if (ticketToDelete) {
      await deleteTicket(ticketToDelete.id);
      setTicketToDelete(null);
    }
  };

  const handleStatusChange = async (ticketId: number, status: TicketStatus) => {
    await updateTicketStatus(ticketId, status);
    await loadTicketsByTab(activeTab);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ticket Dashboard</h1>
          <p className="text-sm text-gray-500">Assigned, reported, and all tickets in one place.</p>
        </div>

        {canCreateTicket && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "ASSIGNED" ? "default" : "outline"}
          onClick={() => setActiveTab("ASSIGNED")}
        >
          Assigned
        </Button>
        <Button
          variant={activeTab === "REPORTED" ? "default" : "outline"}
          onClick={() => setActiveTab("REPORTED")}
        >
          Reported
        </Button>
        <Button
          variant={activeTab === "ALL" ? "default" : "outline"}
          onClick={() => setActiveTab("ALL")}
          disabled={!canSeeAllTab}
        >
          All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.open}</p>
          <p className="text-sm text-gray-500">Open</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
          <p className="text-sm text-gray-500">Resolved</p>
        </div>
      </div>

      {(error || usersError) && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md mb-4">{error || usersError}</div>
      )}

      {!isLoading && (
        <p className="text-sm text-gray-400 mb-4">Showing {tickets.length} ticket(s) in {activeTab.toLowerCase()} view</p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          canEdit={canCreateTicket}
          canDelete={canDeleteTicket}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}

      <TicketForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        ticket={selectedTicket}
        assignees={assignees}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{ticketToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await handleDeleteConfirm();
                setIsDeleteOpen(false);
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

export default DashboardPage;
