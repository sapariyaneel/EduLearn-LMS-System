package com.elearn.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String name;
	
	@Column(nullable = false, unique = true)
	private String email;
	
	@Column(nullable = false)
	private String password;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role = UserRole.STUDENT;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserStatus status = UserStatus.ACTIVE;
	
	private String profileImage;
	
	@Column(name = "join_date", nullable = false, updatable = false)
	private LocalDateTime joinDate = LocalDateTime.now();
	
	@Column(name = "last_active")
	private LocalDateTime lastActive;
	
	public enum UserRole {
		STUDENT, INSTRUCTOR, ADMIN
	}
	
	public enum UserStatus {
		ACTIVE, INACTIVE, BLOCKED
	}
}
