package com.taskmanager.taskmanager.feature.activitylog;

import com.taskmanager.taskmanager.feature.comment.events.CommentAddedEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketCreatedEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketReassignEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketStatusChangedEvent;
import com.taskmanager.taskmanager.shared.enums.ActionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;


/**
 * listens to all ticket and comment events
 * logs every action to the activity_logs table
 * TicketService has no idea this class exists
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivityLogListener {


    private final ActivityLogService activityLogService;


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) // this will fire after the ticket has been created to the database
    public void handleTicketCreated(TicketCreatedEvent event) {
        log.info("Logging ticket creation: {}", event.getTicket().getTitle());


        activityLogService.log(
                event.getTicket(),
                event.getReporter(),
                ActionType.CREATED,
                null,
                event.getTicket().getTitle()
        );


        if(event.getAssignee() != null) {
        activityLogService.log(
                event.getTicket(),
                event.getReporter(),
                ActionType.ASSIGNED,
                null,
                event.getAssignee().getName()
        );

        }
    }



    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStatusChanged(TicketStatusChangedEvent event) {
        log.info("Logging status change for ticket {}: {} -> {}",
                event.getTicket().getTitle(),
                event.getOldStatus(),
                event.getNewStatus()
        );

        activityLogService.log(
                event.getTicket(),
                event.getChangedBy(),
                ActionType.STATUS_CHANGED,
                event.getOldStatus().name(),
                event.getNewStatus().name()
        );
    }


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReassignment(TicketReassignEvent event) {
        log.info("Logging reassignment for ticket {}: {} -> {}",
                event.getTicket().getTitle(),
                event.getOldAssignee().getName(),
                event.getNewAssignee().getName()
        );

        activityLogService.log(
                event.getTicket(),
                event.getReassignedBy(),
                ActionType.REASSIGNED,
                event.getOldAssignee().getName(),
                event.getNewAssignee().getName()
        );
    }



    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCommentAdded(CommentAddedEvent event) {
        log.info("Logging Comment by {}", event.getAuthor().getName() );

        activityLogService.log(
                event.getComment().getTicket(),
                event.getAuthor(),
                ActionType.COMMENTED,
                null,
                event.getComment().getContent()
        );



    }
}
