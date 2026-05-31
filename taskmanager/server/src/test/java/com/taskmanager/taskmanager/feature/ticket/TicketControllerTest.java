package com.taskmanager.taskmanager.feature.ticket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.shared.enums.Category;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TicketStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() throws Exception {
        ticketRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        UserRequestDTO admin = new UserRequestDTO();
        admin.setName("Admin User");
        admin.setEmail("admin@email.com");
        admin.setPassword("123456");

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(write(admin)));
    }

    @Test
    void regularUserCannotListOrReadAnotherUsersTicket() throws Exception {
        createUser("User One", "user1@email.com");
        Long userTwoId = createUser("User Two", "user2@email.com");

        Ticket ticket = new Ticket();
        ticket.setTitle("Private ticket");
        ticket.setDescription("Owned by admin / user2");
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setPriority(Priority.MEDIUM);
        ticket.setCategory(Category.BUG);
        ticket.setReporter(userRepository.findByEmail("admin@email.com").orElseThrow());
        ticket.setAssignee(userRepository.findById(userTwoId).orElseThrow());
        ticket.setDueDate(LocalDate.now().plusDays(1));
        Ticket savedTicket = ticketRepository.save(ticket);

        String userOneToken = login("user1@email.com", "123456");

        mockMvc.perform(get("/api/tickets")
                        .header("Authorization", "Bearer " + userOneToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tickets/" + savedTicket.getId())
                        .header("Authorization", "Bearer " + userOneToken))
                .andExpect(status().isForbidden());
    }

    private Long createUser(String name, String email) throws Exception {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setName(name);
        dto.setEmail(email);
        dto.setPassword("123456");

        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(write(dto)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("id").asLong();
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "%s",
                                    "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("accessToken").asText();
    }

    private String write(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}


