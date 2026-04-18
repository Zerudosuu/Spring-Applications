package com.taskmanager.taskmanager.feature.attachment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class AttachmentUploadRequestDTO {

    @NotNull
    private Long ticketId;

    @NotNull
    private MultipartFile file;
}

