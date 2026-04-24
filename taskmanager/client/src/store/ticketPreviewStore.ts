import {create} from "zustand";

interface TicketPreviewState {
    selectedTicketId: number | null;
    setSelectedTicketId: (ticketId: number | null) => void;
}

export const useTicketPreviewStore = create<TicketPreviewState>((set) => ({
    selectedTicketId: null,
    setSelectedTicketId: (ticketId) => set({selectedTicketId: ticketId}),
}));