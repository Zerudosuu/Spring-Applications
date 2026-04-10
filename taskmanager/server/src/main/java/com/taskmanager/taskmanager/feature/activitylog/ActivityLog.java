package com.taskmanager.taskmanager.feature.activitylog;

import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.enums.ActionType;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Which ticket this activity belongs to
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // Who performed this activity
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User performedBy;

    //What happened
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType actionType;

    @Column
    private String oldValue; // For updates, the previous value (e.g., old status, old assignee)

    @Column
    private String newValue; // For updates, the new value (e.g., new status, new assignee)

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
