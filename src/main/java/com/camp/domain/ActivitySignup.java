package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_signups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySignup {
    @Id
    private String id;
    @Column(nullable = false)
    private String activityId;
    @Column(nullable = false)
    private String openid;
    private String username;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String phone;
    private LocalDateTime createdAt;
}
