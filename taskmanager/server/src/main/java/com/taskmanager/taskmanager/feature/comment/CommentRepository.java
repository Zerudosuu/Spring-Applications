package com.taskmanager.taskmanager.feature.comment;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    //get All comments for ticket ordered by oldest first
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    //delete all comments when a ticket is deleted
    @Modifying
    @Transactional
    void deleteByTicketId(Long ticketId);
}
