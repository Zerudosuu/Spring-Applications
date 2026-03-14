package com.taskmanager.taskmanager.feature.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // converts secret string into cryptographic key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // called once at login — generates signed token with email and expiry baked in
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // reads the email baked into the token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // checks if token has expired — returns false if expired or tampered
    public boolean isTokenValid(String token) {
        try {
            return !getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // returns how many milliseconds are left before token expires
    // used by logout to set Redis/blacklist expiry to match token expiry
    public long getRemainingExpiry(String token) {
        Date tokenExpiration = getClaims(token).getExpiration();
        return tokenExpiration.getTime() - System.currentTimeMillis();
    }

    // internal helper — parses and verifies the token signature
    // throws ExpiredJwtException if token is expired
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}