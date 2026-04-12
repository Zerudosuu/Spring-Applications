import { useState, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED"
    | "CANCELED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory = "BUG" | "FEATURE" | "TASK";

export interface TicketAssignee {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN" | "TRIAGE";
}

export interface Ticket {
    id: number;
    title: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    reporterId: number;
    reporterName: string;
    assigneeId: number;
    assigneeName: string;
    dueDate: string; // ISO date string (yyyy-MM-dd)
    createdAt: string; // ISO datetime string
    updatedAt: string; // ISO datetime string
}

export interface TicketRequest {
    title: string;
    description?: string;
    priority: TicketPriority;
    category: TicketCategory;
    // backend currently ignores status on create/update body but accepts it in DTO.
    status?: TicketStatus;
    assigneeId: number;
    dueDate: string; // ISO date string (yyyy-MM-dd)
}

const useTickets = () => {
    const { user } = useAuthStore();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [assignees, setAssignees] = useState<TicketAssignee[]>([]);
    const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const getAssignedTickets = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get<Ticket[]>("/tickets/assigned");
            setTickets(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch assigned tickets. Please try again.");
            toast.error("Failed to load assigned tickets.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const getReportedTickets = useCallback(async () => {
        try {
            const response = await axiosInstance.get<Ticket[]>("/tickets/reported");
            setTickets(response.data);
            return response.data;
        } catch (err) {
            toast.error("Failed to load reported tickets.");
            throw err;
        }
    }, []);

    const getAllTickets = useCallback(async () => {
        try {
            const response = await axiosInstance.get<Ticket[]>("/tickets");
            setTickets(response.data);
            return response.data;
        } catch (err) {
            toast.error("Failed to load all tickets.");
            throw err;
        }
    }, []);

    const getTicketById = useCallback(async (ticketId: number) => {
        try {
            const response = await axiosInstance.get<Ticket>(`/tickets/${ticketId}`);
            setCurrentTicket(response.data);
            return response.data;
        } catch (err) {
            toast.error("Failed to load ticket details.");
            throw err;
        }
    }, []);

    const getAssignableUsers = useCallback(async () => {
        try {
            const response = await axiosInstance.get<TicketAssignee[]>("/users");
            setAssignees(response.data);
            return response.data;
        } catch {
            // /users can be admin-only depending on backend policy.
            setAssignees([]);
            return [];
        }
    }, []);

    const createTicket = useCallback(async (ticketData: TicketRequest) => {
        try {
            const response = await axiosInstance.post<Ticket>("/tickets", ticketData);
            setTickets((prev) => [response.data, ...prev]);
            toast.success("Ticket created successfully!");
            return response.data;
        } catch (err) {
            toast.error("Failed to create ticket.");
            throw err;
        }
    }, []);

    const updateTicket = useCallback(async (ticketId: number, ticketData: TicketRequest) => {
        try {
            const response = await axiosInstance.put<Ticket>(
                `/tickets/${ticketId}`,
                ticketData,
            );

            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === ticketId ? response.data : ticket)),
            );

            setCurrentTicket((prev) => (prev?.id === ticketId ? response.data : prev));

            toast.success("Ticket updated successfully!");
            return response.data;
        } catch (err) {
            toast.error("Failed to update ticket.");
            throw err;
        }
    }, []);

    const updateTicketStatus = useCallback(async (ticketId: number, status: TicketStatus) => {
        try {
            const response = await axiosInstance.put<Ticket>(`/tickets/${ticketId}/status`, {
                status,
            });

            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === ticketId ? response.data : ticket)),
            );

            setCurrentTicket((prev) => (prev?.id === ticketId ? response.data : prev));

            toast.success("Ticket status updated!");
            return response.data;
        } catch (err) {
            toast.error("Failed to update ticket status.");
            throw err;
        }
    }, []);

    const reassignTicket = useCallback(async (ticketId: number, assigneeId: number) => {
        try {
            const response = await axiosInstance.put<Ticket>(`/tickets/${ticketId}/assign`, {
                assigneeId,
            });

            setTickets((prev) =>
                prev.map((ticket) => (ticket.id === ticketId ? response.data : ticket)),
            );

            setCurrentTicket((prev) => (prev?.id === ticketId ? response.data : prev));

            toast.success("Ticket reassigned successfully!");
            return response.data;
        } catch (err) {
            toast.error("Failed to reassign ticket.");
            throw err;
        }
    }, []);

    const deleteTicket = useCallback(async (ticketId: number) => {
        try {
            await axiosInstance.delete(`/tickets/${ticketId}`);
            setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
            setCurrentTicket((prev) => (prev?.id === ticketId ? null : prev));
            toast.success("Ticket deleted successfully!");
        } catch (err) {
            toast.error("Failed to delete ticket.");
            throw err;
        }
    }, []);

    return {
        tickets,
        assignees,
        currentTicket,
        isLoading,
        error,
        getAssignedTickets,
        getReportedTickets,
        getAllTickets,
        getTicketById,
        getAssignableUsers,
        createTicket,
        updateTicket,
        updateTicketStatus,
        reassignTicket,
        deleteTicket,
    };
};

export default useTickets;