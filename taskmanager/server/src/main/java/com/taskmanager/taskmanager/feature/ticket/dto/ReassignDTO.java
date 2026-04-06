package com.taskmanager.taskmanager.feature.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReassignDTO {
    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;
}
