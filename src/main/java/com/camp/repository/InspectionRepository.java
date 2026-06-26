package com.camp.repository;

import com.camp.domain.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, String> {
    List<Inspection> findByStatus(String status);
}
