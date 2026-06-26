package com.camp.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    private String id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String phone;
    @Column(nullable = false)
    private String zone;
    @Column(nullable = false)
    private LocalDate date;
    private int people;
    @Column(nullable = false)
    private String status;
    @Column(length = 500)
    private String remark;
    private LocalDateTime createdAt;
}
