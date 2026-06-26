package com.camp.repository;

import com.camp.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByStatus(String status);
}
