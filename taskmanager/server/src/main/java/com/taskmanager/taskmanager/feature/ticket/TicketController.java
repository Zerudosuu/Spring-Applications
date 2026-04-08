package com.taskmanager.taskmanager.feature.ticket;


import com.taskmanager.taskmanager.feature.ticket.dto.ReassignDTO;
import com.taskmanager.taskmanager.feature.ticket.dto.TicketRequestDTO;
import com.taskmanager.taskmanager.feature.ticket.dto.TicketResponseDTO;
import com.taskmanager.taskmanager.feature.ticket.dto.UpdateStatusDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController; import org.springframework.security.access.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    //create a new ticket
    //reporter = current logged-in user

    @PostMapping
    public ResponseEntity<TicketResponseDTO> create(@RequestBody @Valid TicketRequestDTO dto, Authentication authentication)  {


        String reporterEmail = authentication.getName();
        TicketResponseDTO createdTicket = ticketService.createTicket(dto, reporterEmail);
        return ResponseEntity.ok(createdTicket);
    }

    // this is for the user
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssigned(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getAssignedToMe(authentication.getName()));
    }

    // this is for the TRIAGE
    @GetMapping("/reported")
    public ResponseEntity<List<TicketResponseDTO>> getReported(Authentication authentication) {
    return ResponseEntity.ok(ticketService.getReportedByMe(authentication.getName()));
    }

    // For Admin
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getById(@PathVariable Long id, Authentication authentication) throws AccessDeniedException {
        return ResponseEntity.ok(ticketService.getTicketById(id, authentication.getName()));
    }

    //updating the ticket so we use PutMapping
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> update(@PathVariable Long id, @RequestBody @Valid TicketRequestDTO dto, Authentication authentication) throws AccessDeniedException {
        return ResponseEntity.ok(ticketService.updateTicket(id, dto, authentication.getName()));
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id, @RequestBody @Valid UpdateStatusDTO dto, Authentication authentication) throws AccessDeniedException {
        return ResponseEntity.ok(ticketService.updateStatus(id, dto.getStatus(), authentication.getName()));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> reAssign(@PathVariable Long id, @RequestBody @Valid ReassignDTO dto, Authentication authentication) throws AccessDeniedException {
        return ResponseEntity.ok(ticketService.reassignTicket(id, dto.getAssigneeId(), authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) throws AccessDeniedException {
        ticketService.deleteTicket(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

}


