package com.taskmanager.taskmanager.feature.attachment;

import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentUploadRequestDTO;
import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponseDTO> uploadAttachment(
            @Valid @ModelAttribute AttachmentUploadRequestDTO request
    ) {
        return ResponseEntity.ok(attachmentService.uploadFile(request));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<AttachmentResponseDTO>> getByTicketId(@PathVariable Long ticketId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByTicketId(ticketId));
    }
}

