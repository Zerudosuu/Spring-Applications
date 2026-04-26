package com.taskmanager.taskmanager.feature.activitylog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.ticket.TicketRepository;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ActivityLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {

        //wipe database before each tests so it will not affect others
        ticketRepository.deleteAll();
        activityLogRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();


        //Create user then login to get the token
        UserRequestDTO userRequestDTO = new UserRequestDTO();
        userRequestDTO.setName("Ronald Salvador");
        userRequestDTO.setEmail("ronald@email.com");
        userRequestDTO.setPassword("123456");

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequestDTO)));

        String loginBody = """
                { 
                    "email":"ronald@email.com",
                    "password":"123456"
                } 
                """;

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andReturn()
                .getResponse()
                .getContentAsString();

        accessToken = objectMapper.readTree(loginResponse).get("accessToken").asText();

    }

    @Test
    void getActivityLogs_Return200_WithValidToken() throws Exception {
        mockMvc.perform(get("/api/activity-logs/ticket/1")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    void getActivityLogs_Return401_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/activity-logs/ticket/1"))
                .andExpect(status().isUnauthorized());
    }

}
