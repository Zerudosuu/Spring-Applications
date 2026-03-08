package com.taskmanager.taskmanager.feature.auth;


import com.taskmanager.taskmanager.feature.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;


/**
 * Created a new entity for refresh token so that the access token can be refreshed when it was expired
 * Access token is short-lived while refresh token long-lived for about 7 days
 * We're adding refresh token for the user be able to log out securely and would not be able to use the same token when they logged out
 */

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    /**
     * Joining the refresh token and user and formed one-to-one relationship because one user can only have one refresh token
     */
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

}
