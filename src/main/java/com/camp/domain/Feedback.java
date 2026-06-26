package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    @Id
    private String id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, length = 1000)
    private String content;
    @Column(nullable = false)
    private String status;
    private LocalDateTime createdAt;
}
