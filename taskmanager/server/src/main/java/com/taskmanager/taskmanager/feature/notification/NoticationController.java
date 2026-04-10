package com.taskmanager.taskmanager.feature.notification;

import com.taskmanager.taskmanager.feature.notification.dto.NotificationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NoticationController {

    private final NotificationService notificationService;


    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnread(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAll(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getAllNotifications(authentication.getName()));
    }

    @PutMapping("/read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}
