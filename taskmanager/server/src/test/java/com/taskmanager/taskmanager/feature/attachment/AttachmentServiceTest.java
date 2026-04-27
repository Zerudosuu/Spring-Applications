package com.taskmanager.taskmanager.feature.attachment;

import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentUploadRequestDTO;
import com.taskmanager.taskmanager.feature.attachment.dto.AttachmentResponseDTO;
import com.taskmanager.taskmanager.feature.attachment.external.CloudinaryService;
import com.taskmanager.taskmanager.feature.attachment.external.SupabaseService;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.ticket.TicketRepository;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttachmentServiceTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private SupabaseService supabaseService;

    @InjectMocks
    private AttachmentService attachmentService;



    @Test
    void getAttachmentsByTicketId_returnsList() {
        // Arrange
        Long ticketId = 1L;
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);

        Attachment attachment = new Attachment();
        attachment.setId(10L);
        attachment.setTicket(ticket);
        attachment.setFilename("test.txt");
        attachment.setFileUrl("http://supabase.com/test.txt");
        attachment.setFileType("text/plain");
        attachment.setFileSize(5L);
        attachment.setUploadedAt(LocalDateTime.now());

        when(attachmentRepository.findByTicketId(ticketId)).thenReturn(List.of(attachment));

        // Act
        List<AttachmentResponseDTO> result = attachmentService.getAttachmentsByTicketId(ticketId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        assertEquals(ticketId, result.get(0).getTicketId());
        assertEquals("test.txt", result.get(0).getFilename());
        verify(attachmentRepository).findByTicketId(ticketId);
    }


    @Test
    void uploadFile_nonImage_usesSupabaseAndReturnsAttachmentResponseDTO() {
        // Arrange
        Long ticketId = 1L;
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "Hello".getBytes());
        AttachmentUploadRequestDTO request = new AttachmentUploadRequestDTO();
        request.setTicketId(ticketId);
        request.setFile(file);

        Ticket ticket = new Ticket();
        ticket.setId(ticketId);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(supabaseService.uploadFile(file)).thenReturn("http://supabase.com/test.txt");
               when(attachmentRepository.save(any(Attachment.class)))
                .thenAnswer(invocation -> {
                    Attachment a = invocation.getArgument(0);
                    a.setId(10L); // simulate DB-generated id
                    return a;
                });

        //Act
        var result = attachmentService.uploadFile(request);

        //assert
        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("test.txt", result.getFilename());
        assertEquals("http://supabase.com/test.txt", result.getFileUrl());
        assertEquals(ticketId, result.getTicketId());


        verify(ticketRepository).findById(ticketId);
        verify(supabaseService).uploadFile(file);
        verify(cloudinaryService, never()).uploadImage(file); // should not call Cloudinary
        verify(attachmentRepository).save(any(Attachment.class));
    }

    @Test
    void uploadFile_image_usesCloudinaryAndReturnsAttachmentResponseDTO() {
        // Arrange
        Long ticketId = 2L;
        MockMultipartFile image = new MockMultipartFile("file", "test.png", "image/png", new byte[]{1, 2, 3});

        AttachmentUploadRequestDTO request = new AttachmentUploadRequestDTO();
        request.setTicketId(ticketId);
        request.setFile(image);

        Ticket ticket = new Ticket();
        ticket.setId(ticketId);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(cloudinaryService.uploadImage(image)).thenReturn("http://cloudinary.com/test.png");
        when(attachmentRepository.save(any(Attachment.class)))
                .thenAnswer(invocation -> {
                    Attachment a = invocation.getArgument(0);
                    a.setId(20L);
                    return a;
                });

        // Act
        AttachmentResponseDTO result = attachmentService.uploadFile(request);

        // Assert
        assertNotNull(result);
        assertEquals(20L, result.getId());
        assertEquals("test.png", result.getFilename());
        assertEquals("http://cloudinary.com/test.png", result.getFileUrl());
        assertEquals("image/png", result.getFileType());
        assertEquals(ticketId, result.getTicketId());

        verify(ticketRepository).findById(ticketId);
        verify(cloudinaryService).uploadImage(image);
        verify(supabaseService, never()).uploadFile(image);
        verify(attachmentRepository).save(any(Attachment.class));
    }

    @Test
    void uploadFile_throwsWhenTicketNotFound() {
        // Arrange
        Long ticketId = 999L;
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "Hello".getBytes());

        AttachmentUploadRequestDTO request = new AttachmentUploadRequestDTO();
        request.setTicketId(ticketId);
        request.setFile(file);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ResourceNotFoundException.class, () -> attachmentService.uploadFile(request));

        verify(ticketRepository).findById(ticketId);
        verifyNoInteractions(supabaseService, cloudinaryService);
        verify(attachmentRepository, never()).save(any(Attachment.class));
    }
}
