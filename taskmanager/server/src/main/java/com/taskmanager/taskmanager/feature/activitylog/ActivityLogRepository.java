package com.taskmanager.taskmanager.feature.activitylog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // get all activity for a ticket ordered oldest first
    // this builds the timeline on the ticket detail page
    List<ActivityLog> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    // delete logs when ticket is deleted
    void deleteByTicketId(Long ticketId);
}
