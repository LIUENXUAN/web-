package com.camp.repository;

import com.camp.domain.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ZoneRepository extends JpaRepository<Zone, String> {
    List<Zone> findByStatus(String status);
}
