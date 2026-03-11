package com.taskmanager.taskmanager.feature.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

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

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private UserRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        //wipes the H2 database before every test so tests don't affect each other.
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
                        .contentType(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest());
    }


}
