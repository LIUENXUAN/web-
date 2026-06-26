package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    @Id
    private String id;
    @Column(nullable = false)
    private String title;
    private LocalDate date;
    private String zone;
    private int quota;
    private int joined;
    @Column(nullable = false)
    private String status;
    @Column(length = 2000)
    private String description;
}
