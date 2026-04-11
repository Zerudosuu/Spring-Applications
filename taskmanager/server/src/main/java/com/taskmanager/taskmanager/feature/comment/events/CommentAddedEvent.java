package com.taskmanager.taskmanager.feature.comment.events;

import com.taskmanager.taskmanager.feature.comment.Comment;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CommentAddedEvent extends ApplicationEvent {

    private final Comment comment;
    private final Ticket ticket;
    private final User author;

    public CommentAddedEvent(Object source, Comment comment, Ticket ticket, User author) {
        super(source);
        this.comment = comment;
        this.ticket = ticket;
        this.author = author;
    }
}