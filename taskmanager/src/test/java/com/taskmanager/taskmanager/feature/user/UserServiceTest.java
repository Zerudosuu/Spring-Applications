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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * @ExtendWith tells JUnit to use Mockito's extension when running this test class.
 * This activates @Mock and @InjectMocks annotations so Mockito can manage them.
 * Without this, @Mock and @InjectMocks would do nothing.
 */

@ExtendWith(MockitoExtension.class)
public class UserServiceTest { // so we are testing first the UserService

    /**
     * @Mock creates a FAKE version of UserRepository.
     * It does not connect to any real database.
     * We control exactly what it returns using when().thenReturn().
     * Purpose: isolate UserService from the real database during testing.
     */
    @Mock
    UserRepository userRepository;

    /**
     * @Mock creates a FAKE version of PasswordEncoder.
     * We control what encode() returns instead of running real BCrypt.
     * Purpose: avoid slow cryptographic operations in unit tests.
     */
    @Mock
    PasswordEncoder passwordEncoder;

    /**
     * @InjectMocks creates the REAL UserService — not a fake.
     * Mockito automatically injects the @Mock fields above into it.
     * So UserService thinks it has a real repository and encoder,
     * but it's actually working with our fakes.
     * Key difference: @Mock = fake dependency, @InjectMocks = real class being tested.
     */
    @InjectMocks
    UserService userService;

    /**
     * These fields have NO annotations because they are plain test data objects.
     * They are not Spring beans, not fakes, not injected by Mockito.
     * They are just regular Java objects we create manually in setUp()
     * to use as input and expected output in our tests.
     */
    private User user;
    private UserRequestDTO userRequest;

    /**
     * @BeforeEach runs before EVERY single test method in this class.
     * Purpose: reset test data to a clean state before each test
     * so that tests never affect each other.
     * If we set this up inside each test instead, we would repeat ourselves constantly.
     */
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

    /**
     * @Test marks this method as a test case that JUnit will run.
     * Naming convention: methodBeingTested_ExpectedBehavior_Condition
     * Example: createUser_Success means we expect createUser to succeed.
     */
    @Test
    void createUser_Success() {
        // ARRANGE — tell fakes what to return when called
        // when().thenReturn() = "when this method is called, return this value"
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(userRequest.getPassword())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        //Act - call the real method
        UserResponseDTO userResponseDTO = userService.createUser(userRequest);

        //Assert = verify the result
        assertThat(userResponseDTO).isNotNull();
        assertThat(userResponseDTO.getName()).isEqualTo("Ronald Salvador");
        assertThat(userResponseDTO.getEmail()).isEqualTo("ronald@email.com");

        // VERIFY — confirm the fake repository was actually called
        // verify(mock, times(1)) means "this method must have been called exactly once"
        // This confirms createUser() actually tried to save to the database
        verify(userRepository, times(1)).save(any(User.class));

    }

    @Test
    void createUser_ThrowsDuplicateException_WhenEmailExists() {

        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(true);

        /* ACT + ASSERT
         assertThatThrownBy() catches the exception thrown inside the lambda
         () -> is a lambda — it lets assertThatThrownBy execute the code
         and catch whatever exception is thrown during execution
         */
        assertThatThrownBy(() -> userService.createUser(userRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already in use");
        /*
         VERIFY — save() must NEVER be called when duplicate email is detected
          The service should throw immediately and never reach the save() call.
          never() confirms save() was not called at all.
          This is important — it proves the service doesn't write bad data to the database.
          No need to verify existsByEmail() here — assertThatThrownBy already proves
          the service reacted correctly to it returning true.
         */
        verify(userRepository, never()).save(any(User.class));
    }


    @Test
    void getUserByID_Success() {
        // ARRANGE — fake repository returns our test user when searched by ID
        // Optional.of(user) wraps the user in an Optional,
        // matching what findById() actually returns in real code
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        //ACT
        UserResponseDTO result = userService.getUserById(1L);

        //ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Ronald Salvador");
        assertThat(result.getId()).isEqualTo(1L);

        // NO verify() here — because this test only checks the RETURN VALUE.
        // We are not testing whether the database was written to.
        // findById() is a read operation — we only care about what came back,
        // not how many times the repository was called.
    }

    @Test
    void getUserById_ThrowsNotFoundException_WhenUserDoesNotExist() {
        // ARRANGE — fake repository returns empty, simulating user not found
        // Optional.empty() = no user exists with this ID
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // ACT + ASSERT
        // No verify() needed here either — same reason as above.
        // We are only testing that the service throws the right exception
        // when the repository returns nothing. No write operation to verify.
        assertThatThrownBy(() -> userService.getUserById(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getAllUsers_ReturnsListofUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserResponseDTO> result = userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Ronald Salvador");
    }

    @Test
    void getAllUsers_ReturnEmptyList_WhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());
        List<UserResponseDTO> result = userService.getAllUsers();

        assertThat(result).isEmpty();
    }

    @Test
    void deleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        userService.deleteUser(1L);
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void deleteUser_ThrownNotFoundException_WhenUserDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).delete(any(User.class));
    }
}
