package com.taskmanager.taskmanager.feature.user;


import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.feature.user.dto.UserResponseDTO;
import com.taskmanager.taskmanager.shared.enums.Role;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody @Valid UserRequestDTO userRequestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userRequestDTO));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(userService.getUserById(id, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    //I think missing is, getting the profile which I think the ID now.
    //TODO: Fix the authorities and return base on the correct logic

    @GetMapping("/role")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponseDTO>> getAllUsersByRole(@RequestParam Role role, Authentication authentication) {
        return ResponseEntity.ok(userService.getAllUsersByRole(role, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }

    //EmailService
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            return ResponseEntity.ok("Email verified successfully! You can now log in.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEmailVerified()) {
            return ResponseEntity.badRequest().body("Email already verified");
        }

        userService.generateAndSendVerificationToken(user);
        return ResponseEntity.ok("Verification email sent");
    }
}
