package com.taskmanager.taskmanager.feature.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    //get All comments for ticket ordered by oldest first
    List<Comment> findByTicketIdOrderByCreateAsc(Long ticketId);

    //delete all comments when a ticket is deleted
    void deleteByTicketId(Long ticketId);
}
