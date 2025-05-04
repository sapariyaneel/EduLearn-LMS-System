package com.elearn.util;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    // Hard-coded secret key - in production this should be in a secure config
    private final String SECRET_STRING = "eduLearnSecretKey123456789012345678901234567890";
    private final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String email) {
        System.out.println("Generating token for: " + email);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days
        
        String token = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
        
        System.out.println("Token generated successfully, length: " + token.length());
        return token;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (ExpiredJwtException e) {
            // Return subject even if token is expired
            return claimsResolver.apply(e.getClaims());
        } catch (Exception e) {
            System.err.println("Error extracting claim from token: " + e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token, String email) {
        try {
            final String extractedEmail = extractUsername(token);
            boolean valid = (extractedEmail != null && extractedEmail.equals(email) && !isTokenExpired(token));
            System.out.println("Token validation result: " + valid + " for user: " + email);
            return valid;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired for user: " + email);
            return false;
        } catch (JwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error validating token: " + e.getMessage());
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.err.println("Error parsing token: " + e.getClass().getName() + " - " + e.getMessage());
            throw e;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            boolean expired = expiration.before(new Date());
            if (expired) {
                System.out.println("Token expired at: " + expiration);
            }
            return expired;
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            System.err.println("Error checking token expiration: " + e.getMessage());
            return true;
        }
    }
}
