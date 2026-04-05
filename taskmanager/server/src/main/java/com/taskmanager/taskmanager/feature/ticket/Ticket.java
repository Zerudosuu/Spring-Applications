package com.taskmanager.taskmanager.feature.ticket;


import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.enums.Category;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name ="tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //ticket Title - Short Summary of the issue
    @Column(nullable = false)
    private String title;

    //detailed description of the issue
    @Column(length = 1000)
    private String description;

    //Current Status in the workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    // how urgent this ticket is
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    // what type of work this is
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;


    // who created the ticket — never changes after creation // this is triage
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    // who is currently responsible for this ticket
    // can be changed via reassign
    @ManyToOne
    @JoinColumn(name = "assignee_id", nullable = false)
    private User assignee;

    // when this ticket must be completed — required
    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // default status when ticket is first created
        if (status == null) {
            status = TicketStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
