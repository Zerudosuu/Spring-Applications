package com.taskmanager.taskmanager.feature.user;


import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.feature.user.dto.UserResponseDTO;
import com.taskmanager.taskmanager.shared.exception.DuplicateResourceException;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    UserRepository userRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @InjectMocks
    UserService userService;

    private User user;
    private UserRequestDTO userRequest;


    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("Ronald Salvador");
        user.setEmail("ronald@email.com");
        user.setPassword("hashedpassword");

        userRequest = new UserRequestDTO();
        userRequest.setName("Ronald Salvador");
        userRequest.setEmail("ronald@email.com");
        userRequest.setPassword("123456");
    }


    @Test
    void createUser_Success() {
        //Arrange - set up what the fakes return
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(userRequest.getPassword())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        //Act - call the real method
        UserResponseDTO userResponseDTO = userService.createUser(userRequest);

        //Assert = verify the result
        assertThat(userResponseDTO).isNotNull();
        assertThat(userResponseDTO.getName()).isEqualTo("Ronald Salvador");
        assertThat(userResponseDTO.getEmail()).isEqualTo("ronald@email.com");

        //Verify repository was called
        verify(userRepository, times(1)).save(any(User.class));

    }

    @Test
    void createUser_ThrowsDuplicateException_WhenEmailExists() {
        //ARRANGE
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(true);

        //ACT + ASSERT
        assertThatThrownBy(() -> userService.createUser(userRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already in use");

        //Verify
        verify(userRepository, never()).save(any(User.class));
    }


    @Test
    void getUserByID_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserResponseDTO result = userService.getUserById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Ronald Salvador");
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getUserById_ThrowsNotFoundException_WhenUserDoesNotExist() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
