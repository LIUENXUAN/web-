package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "inspections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inspection {
    @Id
    private String id;
    @Column(nullable = false)
    private String title;
    private String zone;
    private String owner;
    private String frequency;
    private LocalDate dueDate;
    private String status;
    @Column(length = 1000)
    private String result;
}
