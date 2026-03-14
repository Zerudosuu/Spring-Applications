package com.taskmanager.taskmanager.feature.auth.services;


import com.taskmanager.taskmanager.feature.auth.RefreshToken;
import com.taskmanager.taskmanager.feature.auth.repository.RefreshTokenRepository;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServices {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;


    /**
     *
     * @param user Making sure that the old refresh token was deleted before creating a new one
     *             UUID.RandomUUID generates random ID to be stored on the db and set as token
     * @return refreshTokenRepository.save(refreshToken);
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        //delete old refresh token
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));

        return refreshTokenRepository.save(refreshToken);
    }


    /**
     *
     * @param token Validating the token first if it exists on the repository and if its expiry is less than the current time date now,
     *              it will be deleted and return exception
     * @return refreshToken
     */
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ResourceNotFoundException("Refresh token not found");
        }

        return refreshToken;
    }

    /**
     *
     * @param user Delete method, I dont know what transactional is
     *                                     TODO: know what transactional annotation is
     */
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
