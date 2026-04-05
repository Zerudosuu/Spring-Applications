package com.taskmanager.taskmanager.feature.ticket.dto;

import com.taskmanager.taskmanager.shared.enums.Category;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Priority is required")
    private Priority priority;

    @NotBlank(message = "Category is required")
    private Category category;

    private TicketStatus status;

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}
