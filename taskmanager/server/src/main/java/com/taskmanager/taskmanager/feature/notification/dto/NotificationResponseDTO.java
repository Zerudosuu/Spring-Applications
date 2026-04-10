package com.taskmanager.taskmanager.feature.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private Long ticketId;
    private String ticketTitle;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}
