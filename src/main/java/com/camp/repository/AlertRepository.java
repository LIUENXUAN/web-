package com.camp.repository;

import com.camp.domain.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findByStatus(String status);
    long countByStatus(String status);
}
