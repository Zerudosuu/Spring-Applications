package com.taskmanager.taskmanager.feature.task;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {


        // wipe database before each test so tests don't affect each other
        taskRepository.deleteAll();
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
    void getTasks_Return200_WithValidToken() throws Exception {
        mockMvc.perform(get("/api/tasks/user/1")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    void getTasks_Returns403_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/tasks/user/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void regularUserCannotCreateOrReadAnotherUsersTasks() throws Exception {
        UserRequestDTO userOne = new UserRequestDTO();
        userOne.setName("User One");
        userOne.setEmail("user1@email.com");
        userOne.setPassword("123456");

        UserRequestDTO userTwo = new UserRequestDTO();
        userTwo.setName("User Two");
        userTwo.setEmail("user2@email.com");
        userTwo.setPassword("123456");

        String userOneResponse = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userOne)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String userTwoResponse = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userTwo)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long userTwoId = objectMapper.readTree(userTwoResponse).get("id").asLong();

        Task taskForUserTwo = new Task();
        taskForUserTwo.setTitle("User Two task");
        taskForUserTwo.setDescription("Private task");
        taskForUserTwo.setStatus(TaskStatus.OPEN);
        taskForUserTwo.setPriority(Priority.MEDIUM);
        taskForUserTwo.setDueDate(LocalDateTime.now().plusDays(1));
        taskForUserTwo.setUser(userRepository.findById(userTwoId).orElseThrow());
        Task savedTask = taskRepository.save(taskForUserTwo);

        String userOneToken = objectMapper.readTree(mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "user1@email.com",
                                    "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + userOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Cross user task",
                                    "description": "Should be forbidden",
                                    "status": "OPEN",
                                    "priority": "MEDIUM",
                                    "dueDate": "2026-06-01T10:00:00",
                                    "userId": %d
                                }
                                """.formatted(userTwoId)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tasks/user/" + userTwoId)
                        .header("Authorization", "Bearer " + userOneToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tasks/" + savedTask.getId())
                        .header("Authorization", "Bearer " + userOneToken))
                .andExpect(status().isForbidden());
    }


}
