package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAccount {
    @Id
    private String id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false, unique = true)
    private String phone;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private String role = "ADMIN";
    @Column(nullable = false)
    private String status = "ACTIVE";
    private String displayName;
    private String email;
    private LocalDateTime lastLogin;
}
