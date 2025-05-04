package com.elearn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow multiple origins for development
        config.addAllowedOrigin("http://localhost:5173"); // Frontend URL
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:5174");
        config.addAllowedOrigin("http://localhost:4200");
        
        // Add production deployed URLs
        config.addAllowedOrigin("https://edulearn-lms.netlify.app");
        config.addAllowedOrigin("https://www.edulearn-lms.netlify.app");
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 