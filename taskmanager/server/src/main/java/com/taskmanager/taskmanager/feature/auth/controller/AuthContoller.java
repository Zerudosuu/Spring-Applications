package com.taskmanager.taskmanager.feature.auth.controller;

import com.taskmanager.taskmanager.feature.auth.dto.LoginDTOs.LoginRequestDTO;
import com.taskmanager.taskmanager.feature.auth.dto.LoginDTOs.LoginResponseDTO;
import com.taskmanager.taskmanager.feature.auth.dto.RefreshTokenDTOs.RefreshTokenRequestDTO;
import com.taskmanager.taskmanager.feature.auth.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthContoller {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@RequestBody @Valid RefreshTokenRequestDTO requestToken) {
        return ResponseEntity.ok(authService.refreshAccessToken(requestToken.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(authService.logout(request.getRefreshToken()));
    }
}
