package com.elearn.util;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.elearn.model.User;
import com.elearn.repo.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;
    
    // List of endpoints that don't need authentication
    private final List<String> publicEndpoints = List.of(
        "/api/users/login", 
        "/api/users/register",
        "/api/users/verify-token",
        "/login",
        "/logout",
        "/create-order",
        "/verify-payment",
        "/api/create-order",
        "/api/verify-payment"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Log the request path for debugging
        System.out.println("JwtFilter evaluating request: " + path + " with method: " + request.getMethod());
        
        // Skip OPTIONS requests (CORS preflight)
        if (request.getMethod().equals("OPTIONS")) {
            System.out.println("Skipping JWT filter for OPTIONS request");
            return true;
        }
        
        // Handle exact path matches
        if (publicEndpoints.contains(path)) {
            System.out.println("Skipping JWT filter for public endpoint: " + path);
            return true;
        }
        
        // Handle pattern-based matches
        boolean isStaticResource = path.startsWith("/static/") || 
                                   path.startsWith("/js/") || 
                                   path.startsWith("/css/") || 
                                   path.startsWith("/images/") || 
                                   path.startsWith("/api/public/") ||
                                   path.startsWith("/error") ||
                                   path.equals("/favicon.ico") ||
                                   path.contains("swagger") ||
                                   path.endsWith(".png") ||
                                   path.endsWith(".jpg") ||
                                   path.endsWith(".css") ||
                                   path.endsWith(".js") ||
                                   path.endsWith(".ico");
                                   
        // Log the results
        if (isStaticResource) {
            System.out.println("Skipping JWT filter for static resource: " + path);
        }
        
        return isStaticResource;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String authorizationHeader = request.getHeader("Authorization");
        
        System.out.println("Processing request: " + path);
        System.out.println("Authorization header present: " + (authorizationHeader != null));

        String token = null;
        String email = null;

        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
                System.out.println("Token found in request");
                
                try {
                    email = jwtUtil.extractUsername(token);
                    System.out.println("Email extracted from token: " + email);
                } catch (Exception e) {
                    System.err.println("Error extracting email from token: " + e.getMessage());
                }
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<User> userDetails = userRepository.findByEmail(email);

                if (userDetails.isPresent()) {
                    User user = userDetails.get();
                    if (jwtUtil.validateToken(token, email)) {
                        System.out.println("Token validation successful for: " + email);
                        
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user, 
                                        null, 
                                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString()))
                                );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("Authentication set in SecurityContext");
                    } else {
                        System.out.println("Token validation failed for: " + email);
                    }
                } else {
                    System.out.println("User not found with email: " + email);
                }
            }
        } catch (Exception e) {
            System.err.println("Error in JWT filter: " + e.getMessage());
            e.printStackTrace();
        }

        chain.doFilter(request, response);
    }
}

