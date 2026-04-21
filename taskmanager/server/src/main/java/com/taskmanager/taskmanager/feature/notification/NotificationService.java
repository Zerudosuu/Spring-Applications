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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByEmail = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(0L);
        CopyOnWriteArrayList<SseEmitter> userEmitters = emittersByEmail.computeIfAbsent(email, key -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(email, emitter));
        emitter.onTimeout(() -> removeEmitter(email, emitter));
        emitter.onError((ex) -> removeEmitter(email, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("Notification stream connected"));
        } catch (IOException ex) {
            removeEmitter(email, emitter);
        }

        return emitter;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(User recipient, Ticket ticket, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .ticket(ticket)
                .message(message)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        notifyUser(recipient.getEmail(), toResponse(saved));
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
    public void markAsRead(String email, Long notificationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private void notifyUser(String email, NotificationResponseDTO payload) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByEmail.get(email);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
            } catch (IOException ex) {
                removeEmitter(email, emitter);
            }
        }
    }

    private void removeEmitter(String email, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByEmail.get(email);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByEmail.remove(email);
        }
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
