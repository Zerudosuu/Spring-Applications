package com.taskmanager.taskmanager.feature.ticket;

import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // tickets assigned to a specific user — their work queue
    List<Ticket> findByAssignee(User assignee);

    // tickets created by a specific user — tickets they reported
    List<Ticket> findByReporter(User reporter);

    // tickets assigned to user filtered by status
    List<Ticket> findByAssigneeAndStatus(User assignee, TicketStatus status);

    // tickets reported by user filtered by status
    List<Ticket> findByReporterAndStatus(User reporter, TicketStatus status);

    // all tickets for a specific assignee or reporter
    // used to get all tickets a user is involved in
    List<Ticket> findByAssigneeOrReporter(User assignee, User reporter);


}
