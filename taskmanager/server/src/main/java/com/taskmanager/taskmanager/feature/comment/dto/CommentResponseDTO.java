package com.taskmanager.taskmanager.feature.comment.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDTO {
    private Long id;
    private String content;
    private Long ticketId;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
}
