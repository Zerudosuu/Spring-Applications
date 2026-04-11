package com.taskmanager.taskmanager.feature.notification;

import com.taskmanager.taskmanager.feature.notification.dto.NotificationResponseDTO;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(User recipient, Ticket ticket, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .ticket(ticket)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponseDTO> getUnreadNotifications(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<NotificationResponseDTO> getAllNotifications(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        notificationRepository.markAllAsRead(user);
    }

    // mark one notification as read
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    //Mapper
    public NotificationResponseDTO toResponse (Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .ticketId(notification.getTicket().getId())
                .ticketTitle(notification.getTicket().getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

}
