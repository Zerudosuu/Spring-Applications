import { useCallback, useEffect, useMemo, useState } from "react";
import useAuthStore from "@/store/authStore";
import useTickets, { type Ticket, type TicketRequest, type TicketStatus } from "@/hooks/useTicket";
import useUsers, { type UserRole, type UserSummary } from "@/hooks/useUsers";
import TicketList from "@/components/tickets/TicketList";
import TicketForm from "@/components/tickets/TicketForm";
import TaskSkeleton from "@/components/tasks/TaskSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Shield, Ticket as TicketIcon, Trash2, Users } from "lucide-react";

type AdminTab = "tickets" | "users";

function AdminDashboard() {
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

  const [activeTab, setActiveTab] = useState<AdminTab>("tickets");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDeleteOpen, setIsTicketDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isUserDeleteOpen, setIsUserDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<number, UserRole>>({});

  const loadAdminData = useCallback(async () => {
    await Promise.all([getAllTickets(), getAllUsers()]);
  }, [getAllTickets, getAllUsers]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    setRoleDrafts(Object.fromEntries(users.map((item) => [item.id, item.role])) as Record<number, UserRole>);
  }, [users]);

  const stats = useMemo(
    () => ({
      totalTickets: tickets.length,
      openTickets: tickets.filter((ticket) => ticket.status === "OPEN").length,
      activeTickets: tickets.filter((ticket) => ["IN_PROGRESS", "OPEN", "REOPENED"].includes(ticket.status)).length,
      users: users.length,
    }),
    [tickets, users],
  );

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
  };

  const handleTicketDeleteClick = (id: number) => {
    const ticket = tickets.find((item) => item.id === id);
    if (ticket) {
      setTicketToDelete(ticket);
      setIsTicketDeleteOpen(true);
    }
  };

  const handleTicketDeleteConfirm = async () => {
    if (!ticketToDelete) {
      return;
    }

    await deleteTicket(ticketToDelete.id);
    setTicketToDelete(null);
  };

  const handleTicketStatusChange = async (ticketId: number, status: TicketStatus) => {
    await updateTicketStatus(ticketId, status);
    await getAllTickets();
  };

  const handleRoleSave = async (adminUser: UserSummary) => {
    const nextRole = roleDrafts[adminUser.id] ?? adminUser.role;
    if (nextRole === adminUser.role) {
      return;
    }

    await updateUserRole(adminUser.id, nextRole);
    await getAllUsers();
  };

  const handleDeleteUserClick = (selectedUser: UserSummary) => {
    setUserToDelete(selectedUser);
    setIsUserDeleteOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) {
      return;
    }

    await deleteUser(userToDelete.id);
    setUserToDelete(null);
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
  );

  const userCards = usersLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-4 shadow-sm animate-pulse">
          <div className="h-4 w-1/2 rounded bg-gray-200 mb-3" />
          <div className="h-3 w-2/3 rounded bg-gray-100 mb-2" />
          <div className="h-8 w-full rounded bg-gray-100 mb-3" />
          <div className="h-8 w-1/3 rounded bg-gray-200 ml-auto" />
        </div>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {users.map((adminUser) => {
        const draftRole = roleDrafts[adminUser.id] ?? adminUser.role;
        const canDeleteCurrentUser = user?.id !== adminUser.id;

        return (
          <Card key={adminUser.id} className="shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{adminUser.name}</CardTitle>
                  <CardDescription>{adminUser.email}</CardDescription>
                </div>
                {user?.id === adminUser.id && (
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                    You
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Role</span>
              </div>

              <Select
                value={draftRole}
                onValueChange={(value) =>
                  setRoleDrafts((prev) => ({ ...prev, [adminUser.id]: value as UserRole }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="TRIAGE">TRIAGE</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoleSave(adminUser)}
                  disabled={draftRole === adminUser.role}
                >
                  Save role
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUserClick(adminUser)}
                  disabled={!canDeleteCurrentUser}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Shield className="h-4 w-4" />
            Admin Console
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Manage tickets and users</h1>
          <p className="mt-2 text-sm text-gray-500">
            View all tickets, reassign work, update user roles, and remove accounts when needed.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === "tickets" ? "default" : "outline"} onClick={() => setActiveTab("tickets")}>
            <TicketIcon className="h-4 w-4 mr-2" />
            Tickets
          </Button>
          <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")}>
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
          <Button variant="outline" onClick={loadAdminData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            <p className="text-sm text-gray-500">Total tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.activeTickets}</p>
            <p className="text-sm text-gray-500">Active tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.openTickets}</p>
            <p className="text-sm text-gray-500">Open tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.users}</p>
            <p className="text-sm text-gray-500">Users</p>
          </CardContent>
        </Card>
      </div>

      {(ticketsError || usersError) && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {ticketsError || usersError}
        </div>
      )}

      {activeTab === "tickets" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Tickets</h2>
              <p className="text-sm text-gray-500">Edit, reassign, and change ticket status from here.</p>
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
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-500">Update roles or delete accounts directly from the dashboard.</p>
          </div>

          {userCards}
        </div>
      )}

      <AlertDialog open={isTicketDeleteOpen} onOpenChange={setIsTicketDeleteOpen}>
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
                await handleTicketDeleteConfirm();
                setIsTicketDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUserDeleteOpen} onOpenChange={setIsUserDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await handleDeleteUserConfirm();
                setIsUserDeleteOpen(false);
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

export default AdminDashboard;
