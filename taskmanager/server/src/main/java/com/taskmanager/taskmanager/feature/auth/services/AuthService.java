package com.taskmanager.taskmanager.feature.auth.services;


import com.taskmanager.taskmanager.feature.auth.JwtUtil;
import com.taskmanager.taskmanager.feature.auth.RefreshToken;
import com.taskmanager.taskmanager.feature.auth.dto.LoginDTOs.LoginRequestDTO;
import com.taskmanager.taskmanager.feature.auth.dto.LoginDTOs.LoginResponseDTO;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.shared.exception.InvalidCredentialsException;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenServices refreshTokenServices;
    private final RefreshTokenRepository refreshTokenRepository;

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByEmail(loginRequestDTO.getEmail()).orElseThrow(
                () -> new InvalidCredentialsException("Invalid email or password")
        );

        boolean passwordMatch = passwordEncoder.matches(
                loginRequestDTO.getPassword(),
                user.getPassword()
        );

        if (!passwordMatch) {
            throw new InvalidCredentialsException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail()); // this is to generate an accessToken for the user
        RefreshToken refreshToken = refreshTokenServices.createRefreshToken(user); //this is to create a refreshToken

        LoginResponseDTO response = new LoginResponseDTO();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setAccessToken(token);
        response.setRefreshToken(refreshToken.getToken());
        response.setMessage("Login Successful");
        return response;
    }

    public LoginResponseDTO refreshAccessToken(String refreshToken) {
        RefreshToken token = refreshTokenServices.validateRefreshToken(refreshToken);

        User user = token.getUser();
        String newAccessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken rotatedRefreshToken = refreshTokenServices.createRefreshToken(user);

        LoginResponseDTO response = new LoginResponseDTO();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(rotatedRefreshToken.getToken());
        response.setMessage("Token refreshed successfully");
        return response;

    }

    public String logout(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));
        refreshTokenServices.deleteByUser(token.getUser());
        return "Logged out successfully";
    }
}
