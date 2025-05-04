package com.elearn.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elearn.model.User;
import com.elearn.model.User.UserStatus;
import com.elearn.service.UserService;
import com.elearn.util.JwtUtil;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:4200", "https://edulearn-lms.netlify.app", "https://www.edulearn-lms.netlify.app"})
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        
        System.out.println("Login attempt for email: " + email);
        
        // Input validation
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("login", "fail");
            response.put("message", "Email and password are required");
            return ResponseEntity.status(400).body(response);
        }
        
        try {
            Optional<User> userOpt = userService.getUserByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("User found with ID: " + user.getId() + ", role: " + user.getRole());
                
                // Note: In a real application, you should use password encoder here
                // This is a simple equality check for now, but should be replaced with 
                // proper password verification using Spring Security's BCryptPasswordEncoder
                if (user.getPassword().equals(password)) {
                    // Update last active timestamp
                    userService.updateLastActive(user.getId());
                    
                    // Generate token
                    String token = jwtUtil.generateToken(email);
                    if (token == null || token.isEmpty()) {
                        System.err.println("Failed to generate token for user: " + email);
                        Map<String, String> response = new HashMap<>();
                        response.put("login", "fail");
                        response.put("message", "Authentication error");
                        return ResponseEntity.status(500).body(response);
                    }
                    
                    // Create response
                    Map<String, String> response = new HashMap<>();
                    response.put("login", "success");
                    response.put("token", token);
                    response.put("role", user.getRole().toString());
                    response.put("userId", user.getId().toString());
                    response.put("name", user.getName());
                    
                    System.out.println("Login successful for: " + email);
                    return ResponseEntity.ok(response);
                } else {
                    System.out.println("Invalid password for: " + email);
                }
            } else {
                System.out.println("User not found with email: " + email);
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("login", "fail");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("login", "fail");
            response.put("message", "An error occurred during login");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Check if email already exists
            Optional<User> existingUser = userService.getUserByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("register", "fail");
                response.put("message", "Email already in use");
                return ResponseEntity.status(400).body(response);
            }
            
            User savedUser = userService.saveUser(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("register", "success");
            response.put("userId", savedUser.getId().toString());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("register", "fail");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        // Ensure the ID in the path matches the user object
        user.setId(id);
        
        try {
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            UserStatus status = UserStatus.valueOf(statusData.get("status").toUpperCase());
            User updatedUser = userService.updateUserStatus(id, status);
            
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid status value");
            return ResponseEntity.status(400).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Endpoint to verify if a token is valid.
     * This is primarily for debugging authentication issues.
     */
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractUsername(token);
                
                response.put("token_present", true);
                response.put("email", email);
                
                if (email != null) {
                    Optional<User> userOpt = userService.getUserByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        response.put("user_found", true);
                        response.put("user_id", user.getId());
                        response.put("user_role", user.getRole().toString());
                        
                        boolean isTokenValid = jwtUtil.validateToken(token, email);
                        response.put("token_valid", isTokenValid);
                        
                        if (isTokenValid) {
                            return ResponseEntity.ok(response);
                        } else {
                            response.put("message", "Token is invalid or expired");
                            return ResponseEntity.status(401).body(response);
                        }
                    } else {
                        response.put("user_found", false);
                        response.put("message", "User not found with email: " + email);
                        return ResponseEntity.status(401).body(response);
                    }
                } else {
                    response.put("message", "Could not extract email from token");
                    return ResponseEntity.status(401).body(response);
                }
            } else {
                response.put("token_present", false);
                response.put("message", "No token provided in Authorization header");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 