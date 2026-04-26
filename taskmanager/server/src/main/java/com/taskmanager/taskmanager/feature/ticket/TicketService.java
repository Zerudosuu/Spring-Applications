package com.taskmanager.taskmanager.feature.ticket;

import com.taskmanager.taskmanager.feature.activitylog.ActivityLogRepository;
import com.taskmanager.taskmanager.feature.attachment.AttachmentRepository;
import com.taskmanager.taskmanager.feature.comment.CommentRepository;
import com.taskmanager.taskmanager.feature.notification.NotificationRepository;
import com.taskmanager.taskmanager.feature.ticket.dto.TicketRequestDTO;
import com.taskmanager.taskmanager.feature.ticket.dto.TicketResponseDTO;
import com.taskmanager.taskmanager.feature.ticket.events.TicketCreatedEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketReassignEvent;
import com.taskmanager.taskmanager.feature.ticket.events.TicketStatusChangedEvent;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.shared.enums.Role;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final AttachmentRepository attachmentRepository;

    private final ApplicationEventPublisher eventPublisher;
    // TODO: ─── CREATE ──────────────────────────────────────────────────
    // any logged in user can create a ticket
    // reporter = currently logged in user
    // assignee = selected from the form

    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO dto, String reporterEmail)  {

        // temporary — remove after fixing
        System.out.println("Reporter email from token: " + reporterEmail);

        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        // only TRIAGE and ADMIN can create and assign tickets
        if (reporter.getRole() != Role.TRIAGE && reporter.getRole() != Role.ADMIN) {
            throw new AccessDeniedException(
                    "Only TRIAGE or ADMIN can create and assign tickets"
            );
        }

        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .category(dto.getCategory())
                .status(TicketStatus.OPEN)
                .reporter(reporter)
                .assignee(assignee)
                .dueDate(dto.getDueDate())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        eventPublisher.publishEvent(new TicketCreatedEvent(this, saved, reporter, assignee ));
        return toResponseDTO(saved);
    }

    // TODO: ─── GET ASSIGNED TO ME ───────────────────────────────────────
    // tickets where the logged in user is the assignee
    public List<TicketResponseDTO> getAssignedToMe(String assigneeEmail) {
        User assignee = userRepository.findByEmail(assigneeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Ticket> tickets = ticketRepository.findByAssignee(assignee);
        return tickets.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ─── GET REPORTED BY ME ───────────────────────────────────────
    // tickets where the logged in user is the reporter
    public List<TicketResponseDTO> getReportedByMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ticketRepository.findByReporter(user)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }



    // TODO:─── GET ALL — ADMIN ONLY ─────────────────────────────────────
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // TODO: ─── GET BY ID ────────────────────────────────────────────────
    // only reporter, assignee, or admin can view

    public TicketResponseDTO getTicketById(Long id, String email)  {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket Not Found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        return toResponseDTO(ticket);

    }

    // TODO: ─── UPDATE TICKET ────────────────────────────────────────────
    // reporter or assignee can update ticket details
    @Transactional
    public TicketResponseDTO updateTicket (Long id, TicketRequestDTO dto, String email) throws AccessDeniedException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket Not Found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(user.getId());
        boolean isAssignee = ticket.getAssignee().getId().equals(user.getId());

        if(!isAdmin && !isReporter && !isAssignee) {
            throw new AccessDeniedException("You cannot update this ticket");
        }

        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setCategory(dto.getCategory());
        ticket.setDueDate(dto.getDueDate());
        ticket.setAssignee(assignee);
        ticket.setDueDate(dto.getDueDate());

        return toResponseDTO(ticketRepository.save(ticket));
    }


    // TODO: ─── UPDATE STATUS ────────────────────────────────────────────
    // only reporter or assignee can update status
    // status must follow the allowed transition rules
    @Transactional
    public TicketResponseDTO updateStatus(Long id, TicketStatus newStatus, String email) throws AccessDeniedException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(user.getId());
        boolean isAssignee = ticket.getAssignee().getId().equals(user.getId());

        if (!isAdmin && !isReporter && !isAssignee) {
            throw new AccessDeniedException("You cannot update this ticket status");
        }

        // validate status transition
        validateStatusTransition(ticket.getStatus(), newStatus, isAdmin);
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        // fire event — listeners handle everything else
        eventPublisher.publishEvent(
                new TicketStatusChangedEvent(this, saved, user, oldStatus, newStatus)
        );

        return toResponseDTO(saved);
    }


    // TODO: ─── REASSIGN ─────────────────────────────────────────────────
    // reporter, current assignee, or admin can reassign
    @Transactional
    public TicketResponseDTO reassignTicket(Long id, Long newAssigneeId, String email) throws AccessDeniedException {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isReporter = ticket.getReporter().getId().equals(user.getId());
        boolean isCurrentAssignee = ticket.getAssignee().getId().equals(user.getId());

        if (!isAdmin && !isReporter && !isCurrentAssignee) {
            throw new AccessDeniedException("You cannot reassign this ticket");
        }

        User oldAssignee = ticket.getAssignee();
        User newAssignee = userRepository.findById(newAssigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("New assignee not found"));

        ticket.setAssignee(newAssignee);
        Ticket saved = ticketRepository.save(ticket);

        // fire event
        eventPublisher.publishEvent(
                new TicketReassignEvent(this, saved, user, oldAssignee, newAssignee)
        );

        return toResponseDTO(saved);
    }

    // TODO: ─── DELETE — ADMIN ONLY ──────────────────────────────────────
    @Transactional
    public void deleteTicket (Long id, String email)  {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete tickets");
        }

        attachmentRepository.deleteByTicketId(id);
        commentRepository.deleteByTicketId(id);
        activityLogRepository.deleteByTicketId(id);
        notificationRepository.deleteByTicketId(id);
        ticketRepository.delete(ticket);
    }
    // TODO: ─── STATUS TRANSITION VALIDATION ────────────────────────────
    // enforces the allowed status flow:
    // OPEN → IN_PROGRESS → RESOLVED → CLOSED
    // admin can do any transition
    //StateMachine
    private void validateStatusTransition(TicketStatus currentStatus, TicketStatus newStatus, boolean isAdmin) {
        if(isAdmin) return; // admins can do any transition

        boolean valid = switch (currentStatus) {
            case OPEN -> newStatus == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED;
            case RESOLVED -> newStatus == TicketStatus.CLOSED;
            case REOPENED -> newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED; // can move back to in progress or resolved
            case CLOSED, CANCELED -> false; // no transitions allowed from CLOSED
        };

        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }


    // TODO: ───  MAPPER
    private TicketResponseDTO toResponseDTO(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .category(ticket.getCategory())
                .reporterId(ticket.getReporter().getId())
                .reporterName(ticket.getReporter().getName())
                .assigneeId(ticket.getAssignee().getId())
                .assigneeName(ticket.getAssignee().getName())
                .dueDate(ticket.getDueDate())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

}