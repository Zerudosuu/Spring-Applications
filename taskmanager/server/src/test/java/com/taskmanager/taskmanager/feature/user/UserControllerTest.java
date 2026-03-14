package com.taskmanager.taskmanager.feature.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.task.TaskRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UserRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        //wipes the H2 database before every test so tests don't affect each other.
        taskRepository.deleteAll();
        refreshTokenRepository.deleteAll();  // ← must be before userRepository
        userRepository.deleteAll();

        requestDTO = new UserRequestDTO();
        requestDTO.setName("Ronald Salvador");
        requestDTO.setEmail("ronald@email.com");
        requestDTO.setPassword("123456");
    }

    @Test
    void createUser_Returns409_WhenEmailAlreadyEXists() throws Exception {
        //create user first
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ronald Salvador"))
                .andExpect(jsonPath("$.email").value("ronald@email.com"))
                .andExpect(jsonPath("$.password").doesNotExist());

        //try to create again with the same email
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict());
    }

    @Test
    void createUser_Returns409_WhenNameIsBlank() throws Exception {
        requestDTO.setName("");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_Returns400_WhenEmailIsInvalid() throws Exception {
        requestDTO.setEmail("not=a=valide=email");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest());
    }


    @Test
    void getUser_Return200_WithValidToken() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated());

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                "email":"ronald@email.com",
                                "password":"123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();


        // debug — print the response so you can see what came back
        System.out.println("Login response: " + loginResponse);

        String token = objectMapper.readTree(loginResponse).get("accessToken").asText();
        String userId = objectMapper.readTree(loginResponse).get("id").asText();

        mockMvc.perform(get("/api/users/" + userId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ronald@email.com"));
    }

    @Test
    void getUser_Returns401_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllUsers_Returns403_WithRegularUserToken() throws Exception {
        // create regular user and login
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)));

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "ronald@email.com",
                                    "password": "123456"
                                }
                                """))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("accessToken").asText();

        // regular user tries to access admin endpoint
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
