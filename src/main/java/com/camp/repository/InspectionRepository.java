package com.camp.repository;

import com.camp.domain.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, String> {
}
