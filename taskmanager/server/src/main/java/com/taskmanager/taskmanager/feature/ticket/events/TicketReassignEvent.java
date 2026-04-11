package com.taskmanager.taskmanager.feature.ticket.events;

import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TicketReassignEvent extends ApplicationEvent {

    private final Ticket ticket;
    private final User reassignedBy;
    private final User oldAssignee;
    private final User newAssignee;


    public TicketReassignEvent(Object source, Ticket ticket, User reassignedBy, User oldAssignee, User newAssignee) {
        super(source);
        this.ticket = ticket;
        this.reassignedBy = reassignedBy;
        this.oldAssignee = oldAssignee;
        this.newAssignee = newAssignee;
    }
}
