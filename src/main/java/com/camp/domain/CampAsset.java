package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "camp_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampAsset {
    @Id
    private String id;
    @Column(nullable = false)
    private String name;
    private String zone;
    private String type;
    private String status;
    private String priority;
    private LocalDate lastCheck;
    private int health;
    private String owner;
}
