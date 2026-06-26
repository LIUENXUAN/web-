package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    private String id;
    @Column(nullable = false)
    private String title;
    private String zone;
    private String level;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private String owner;
}
