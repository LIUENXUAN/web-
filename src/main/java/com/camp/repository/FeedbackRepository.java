package com.camp.repository;

import com.camp.domain.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, String> {
    List<Feedback> findAllByOrderByCreatedAtDesc();
    Page<Feedback> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
