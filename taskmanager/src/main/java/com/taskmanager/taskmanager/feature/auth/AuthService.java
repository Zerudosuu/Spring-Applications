package com.taskmanager.taskmanager.feature.auth;


import com.taskmanager.taskmanager.feature.auth.dto.LoginRequestDTO;
import com.taskmanager.taskmanager.feature.auth.dto.LoginResponseDTO;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByEmail(loginRequestDTO.getEmail()).orElseThrow(
                () -> new RuntimeException("Invalid email or password")
        );

        boolean passwordMatch = passwordEncoder.matches(
                loginRequestDTO.getPassword(),
                user.getPassword()
        );

        if (!passwordMatch) {
            throw new RuntimeException("Invalid password");
        }

        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setId(user.getId());
        loginResponseDTO.setName(user.getName());
        loginResponseDTO.setEmail(user.getEmail());
        loginResponseDTO.setRole(user.getRole());
        loginResponseDTO.setMessage("Login Successful");
        return loginResponseDTO;
    }
}
