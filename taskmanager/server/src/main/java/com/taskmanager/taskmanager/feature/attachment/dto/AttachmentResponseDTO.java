package com.taskmanager.taskmanager.feature.attachment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponseDTO {

    private Long id;
    private Long ticketId;
    private String filename;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}

