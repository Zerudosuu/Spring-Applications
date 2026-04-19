package com.taskmanager.taskmanager.feature.attachment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentUploadRequestDTO {

    @NotNull
    private Long ticketId;

    @NotNull
    private MultipartFile file;
}

