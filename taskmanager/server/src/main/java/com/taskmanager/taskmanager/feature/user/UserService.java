package com.taskmanager.taskmanager.feature.user;


import com.taskmanager.taskmanager.feature.auth.EmailVerificationToken;
import com.taskmanager.taskmanager.feature.auth.repository.EmailVerificationTokenRepository;
import com.taskmanager.taskmanager.feature.auth.services.EmailService;
import com.taskmanager.taskmanager.feature.user.dto.UserMapper;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.feature.user.dto.UserResponseDTO;
import com.taskmanager.taskmanager.shared.enums.Role;
import com.taskmanager.taskmanager.shared.exception.DuplicateResourceException;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;


    // Convert Entity → ResponseDTO
    private UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO userResponseDTO = new UserResponseDTO();
        userResponseDTO.setId(user.getId());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setRole(user.getRole());
        userResponseDTO.setCreatedDate(user.getCreatedAt());
        return userResponseDTO;
    }

    // Convert RequestDTO → Entity
    private User toEntity(UserRequestDTO userRequestDTO) {
        User user = new User();
        user.setName(userRequestDTO.getName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());
        return user;
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }
        // uncomment if using mapper
        //User user = userMapper.toEntity(dto);
        User user = toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
            user.setEmailVerified(true); // First user is auto-verified admin
            user.setEmailVerifiedAt(LocalDateTime.now());
        } else {
            user.setRole(Role.USER);
            user.setEmailVerified(false);
        }

        User saved = userRepository.save(user);
        // uncomment if using mapper
//        return userMapper.toDTo(saved);


        // Send verification email only for non-admin users
        if (!saved.getEmailVerified()) {
            generateAndSendVerificationToken(saved);
        }
        return toResponseDTO(saved);
    }

    public UserResponseDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        return toResponseDTO(userRepository.save(user));
        // uncomment if using mapper
        // return userMapper.toDTO(userRepository.save(user));
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponseDTO(user);

        // uncomment if using mapper
        //return userMapper.toDTO(user);
    }

    public UserResponseDTO updateUser(UserRequestDTO dto) {
        User saved = userRepository.save(toEntity(dto));
        return toResponseDTO(saved);

        // uncomment if using mapper
        //return userMapper.toDTO(user);;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public UserResponseDTO deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        return toResponseDTO(user);

        // uncomment if using mapper
        //return userMapper.toDTO(user);
    }

    //For Triage
    public List<UserResponseDTO> getAllUsersByRole(Role role) {
        return userRepository.findByRole(role).stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    //for email
    public void generateAndSendVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .used(false)
                .build();

        tokenRepository.save(verificationToken);

        // Send email (you'll need to pass the baseUrl from controller or config)
        emailService.sendVerificationEmail(user.getEmail(), token, appBaseUrl);
    }

    public UserResponseDTO verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));

        if (verificationToken.isExpired()) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        if (verificationToken.getUsed()) {
            throw new IllegalArgumentException("Token already used");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        User savedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        return toResponseDTO(savedUser);
    }

}
