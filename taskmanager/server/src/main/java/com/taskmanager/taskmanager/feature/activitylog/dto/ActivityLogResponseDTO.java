package com.taskmanager.taskmanager.feature.activitylog.dto;

import com.taskmanager.taskmanager.shared.enums.ActionType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponseDTO {

    private Long id;
    private Long ticketId;
    private Long performedById;
    private String performedByName;
    private ActionType action;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;
}
