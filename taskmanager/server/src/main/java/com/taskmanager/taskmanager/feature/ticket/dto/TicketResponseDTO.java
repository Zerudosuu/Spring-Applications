package com.taskmanager.taskmanager.feature.ticket.dto;

import com.taskmanager.taskmanager.shared.enums.Category;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private Category category;

    // reporter info — flattened so frontend doesn't need nested objects
    private Long reporterId;
    private String reporterName;

    // assignee info — flattened
    private Long assigneeId;
    private String assigneeName;

    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
