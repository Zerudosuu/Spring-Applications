package com.taskmanager.taskmanager.feature.ticket.events;

import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketCreatedEvent extends ApplicationEvent {
    private final Ticket ticket;
    private final User reporter;
    private final User assignee;

    public TicketCreatedEvent(Object source, Ticket ticket, User reporter, User assignee) {
        super(source);
        this.ticket = ticket;
        this.reporter = reporter;
        this.assignee = assignee;
    }

}
