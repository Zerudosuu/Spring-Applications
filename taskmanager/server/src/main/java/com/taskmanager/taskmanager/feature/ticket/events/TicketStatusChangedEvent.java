package com.taskmanager.taskmanager.feature.ticket.events;

import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;


@Getter
public class TicketStatusChangedEvent extends ApplicationEvent {

    private final Ticket ticket;
    private final User changedBy;
    private final TicketStatus oldStatus;
    private final TicketStatus newStatus;

    public TicketStatusChangedEvent(Object source, Ticket ticket, User changedBy, TicketStatus oldStatus, TicketStatus newStatus) {
        super(source);
        this.ticket = ticket;
        this.changedBy = changedBy;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
