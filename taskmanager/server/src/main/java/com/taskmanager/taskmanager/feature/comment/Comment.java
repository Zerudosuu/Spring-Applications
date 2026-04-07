package com.taskmanager.taskmanager.feature.comment;


import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    //which ticket this comment belongs to
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;


    //who created this comment
    @ManyToOne
    @JoinColumn(name ="author_id", nullable = false)
    private User author;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void OnCreate() {
        createdAt = LocalDateTime.now();
    }
}
