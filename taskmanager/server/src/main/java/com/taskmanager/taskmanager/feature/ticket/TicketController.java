package com.taskmanager.taskmanager.feature.ticket;


import com.taskmanager.taskmanager.feature.ticket.dto.TicketResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    //create a new ticket
    //reporter = current logged in user

    @PostMapping
    public ResponseEntity<TicketResponseDTO> create (@RequestBody @Valid TicketResponseDTO dto, Authentication authentication) {
        String reporterEmail = authentication.getName();
        TicketResponseDTO createdTicket = ticketService.createTicket(dto, reporterEmail);
        return ResponseEntity.ok(createdTicket);
    }
}
