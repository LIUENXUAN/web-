package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "operation_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String operator;
    @Column(nullable = false)
    private String action;
    private String targetType;
    private String targetId;
    @Column(length = 500)
    private String detail;
    private LocalDateTime createdAt;
}
