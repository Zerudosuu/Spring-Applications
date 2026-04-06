package com.taskmanager.taskmanager.feature.ticket.dto;


import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusDTO {

    @NotNull(message = "Status is required")
    private TicketStatus status;
}
