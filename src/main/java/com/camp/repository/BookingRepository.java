package com.camp.repository;

import com.camp.domain.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findAllByOrderByCreatedAtDesc();
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Booking> findByStatus(String status);
    long countByStatus(String status);
}
