package com.taskmanager.taskmanager.feature.attachment;

import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentUploadRequestDTO;
import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentResponseDTO;
import com.taskmanager.taskmanager.feature.attachment.external.CloudinaryService;
import com.taskmanager.taskmanager.feature.attachment.external.SupabaseService;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.ticket.TicketRepository;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final CloudinaryService cloudinaryService;
    private final SupabaseService supabaseService;

    public AttachmentResponseDTO uploadFile(AttachmentUploadRequestDTO request) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        MultipartFile file = request.getFile();
        String fileUrl;
        String fileType = file.getContentType();

        // Check if the file is an image
        if (fileType != null && fileType.startsWith("image/")) {
            fileUrl = cloudinaryService.uploadImage(file); // Upload to Cloudinary
        } else {
            fileUrl = supabaseService.uploadFile(file); // Upload to Supabase
        }

        // Save metadata to the database
        Attachment attachment = new Attachment();
        attachment.setTicket(ticket);
        attachment.setFilename(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        attachment.setFileUrl(fileUrl);
        attachment.setFileType(fileType);
        attachment.setFileSize(file.getSize());
        attachment.setUploadedAt(LocalDateTime.now());

        Attachment savedAttachment = attachmentRepository.save(attachment);
        return toResponseDTO(savedAttachment);
    }

    public List<AttachmentResponseDTO> getAttachmentsByTicketId(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private AttachmentResponseDTO toResponseDTO(Attachment attachment) {
        return AttachmentResponseDTO.builder()
                .id(attachment.getId())
                .ticketId(attachment.getTicket() != null ? attachment.getTicket().getId() : null)
                .filename(attachment.getFilename())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

}
