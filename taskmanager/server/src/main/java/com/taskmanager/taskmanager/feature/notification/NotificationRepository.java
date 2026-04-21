package com.taskmanager.taskmanager.feature.notification;

import com.taskmanager.taskmanager.feature.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipientId);
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    Optional<Notification> findByIdAndRecipient(Long id, User recipient);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient")
    void markAllAsRead(User recipient);

    // delete notifications when ticket is deleted
    void deleteByTicketId(Long ticketId);
}
