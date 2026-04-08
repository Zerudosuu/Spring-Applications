package com.taskmanager.taskmanager.feature.comment;

import com.taskmanager.taskmanager.feature.comment.dto.CommentRequestDTO;
import com.taskmanager.taskmanager.feature.comment.dto.CommentResponseDTO;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.ticket.TicketRepository;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.shared.enums.Role;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    //--- ADD COMMENT
    public CommentResponseDTO addComment(Long TicketId, CommentRequestDTO dto, String authorEmail)  {
        Ticket ticket = ticketRepository.findById(TicketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // only reporter, assignee, or admin can comment
        boolean isAdmin = author.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(author.getId());
        boolean isAssignee = ticket.getAssignee().getId().equals(author.getId());

        if (!isAdmin && !isReporter && !isAssignee) {
            throw new AccessDeniedException(
                    "You do not have permission to comment on this ticket"
            );
        }

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .ticket(ticket)
                .author(author)
                .build();

        return toResponseDTO(commentRepository.save(comment));
    }

    public List<CommentResponseDTO> getAllComments (Long ticketId, String Email) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User user = userRepository.findByEmail(Email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public void deleteComment(Long commentId, String Email) {

        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User author = userRepository.findByEmail(Email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAuthor = comment.getAuthor().getId().equals(author.getId());

        if(!isAuthor)
            throw new AccessDeniedException("You do not have permission to delete this comment");

        commentRepository.delete(comment);
    }

    //--- MAPPER
    private CommentResponseDTO toResponseDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .ticketId(comment.getTicket().getId())
                .authorId(comment.getAuthor().getId())
                .authorUsername(comment.getAuthor().getUsername())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
