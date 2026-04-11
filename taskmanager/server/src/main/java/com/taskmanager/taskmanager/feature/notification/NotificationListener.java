package com.taskmanager.taskmanager.feature.notification;

import com.taskmanager.taskmanager.feature.comment.events.CommentAddedEvent;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.ticket.events.TicketCreatedEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketReassignEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketStatusChangedEvent;
import com.taskmanager.taskmanager.feature.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;


/** NotificationListener is responsible for handling all events related to tickets and comments, such as creation, updates, status changes, and comments.
 listens to all ticket and comment events
 sends notifications to relevant users
 completely independent of ActivityLogListener
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final NotificationService notificationService;


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTicketCreated(TicketCreatedEvent event) {
        log.info("Sending notification to assignee: {}", event.getAssignee().getName());


    //notify assignee they have been assigned a ticket
    notificationService.createNotification(
            event.getAssignee(),
            event.getTicket(),
            event.getReporter().getName() + " assigned you to ticket: " + event.getTicket().getTitle());
    }


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusChanged(TicketStatusChangedEvent event) {
        Ticket ticket = event.getTicket();
        User changedBy = event.getChangedBy();

        boolean changedByReporter = ticket.getReporter()
                .getId().equals(changedBy.getId());

        boolean changedByAssignee = ticket.getAssignee()
                .getId().equals(changedBy.getId());

        // notify reporter if assignee changed status
        if (changedByAssignee && !changedByReporter) {
            notificationService.createNotification(
                    ticket.getReporter(),
                    ticket,
                    changedBy.getName()
                            + " changed status of '"
                            + ticket.getTitle()
                            + "' to "
                            + event.getNewStatus()
            );
        }

        // notify assignee if reporter changed status
        if (changedByReporter && !changedByAssignee) {
            notificationService.createNotification(
                    ticket.getAssignee(),
                    ticket,
                    changedBy.getName()
                            + " changed status of '"
                            + ticket.getTitle()
                            + "' to "
                            + event.getNewStatus()
            );
        }
    }



    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReassigned(TicketReassignEvent event) {
        log.info("Sending notification to new assignee: {}",
                event.getNewAssignee().getName()
        );

        // notify new assignee they have been assigned
        notificationService.createNotification(
                event.getNewAssignee(),
                event.getTicket(),
                event.getReassignedBy().getName()
                        + " reassigned ticket '"
                        + event.getTicket().getTitle()
                        + "' to you"
        );
    }


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCommentAdded(CommentAddedEvent event) {
        Ticket ticket = event.getTicket();
        User author = event.getAuthor();

        boolean authorIsReporter = ticket.getReporter()
                .getId().equals(author.getId());

        // notify reporter when assignee comments
        if (!authorIsReporter) {
            notificationService.createNotification(
                    ticket.getReporter(),
                    ticket,
                    author.getName()
                            + " commented on '"
                            + ticket.getTitle()
                            + "'"
            );
        }

        // notify assignee when reporter comments
        if (authorIsReporter) {
            notificationService.createNotification(
                    ticket.getAssignee(),
                    ticket,
                    author.getName()
                            + " commented on '"
                            + ticket.getTitle()
                            + "'"
            );
        }
    }



}
