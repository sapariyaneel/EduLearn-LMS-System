package com.elearn.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.elearn.model.User;
import com.elearn.model.User.UserRole;
import com.elearn.repo.UserRepository;

import java.util.Optional;

@Component
public class InitialDataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin exists
        Optional<User> adminUser = userRepository.findByEmail("admin@edulearn.com");
        
        if (!adminUser.isPresent()) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@edulearn.com");
            admin.setPassword("admin123");
            admin.setRole(UserRole.ADMIN);
            
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }
    }
} 