package com.taskmanager.taskmanager.feature.attachment;

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
        when(attachmentRepository.findByTicketId(ticketId)).thenReturn(List.of(new Attachment()));

        // Act
        List<?> result = attachmentService.getAttachmentsByTicketId(ticketId);

        // Assert
        assertEquals(1, result.size());
        verify(attachmentRepository).findByTicketId(ticketId);
    }

}
