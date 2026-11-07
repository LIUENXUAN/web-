package com.camp.repository;

import com.camp.domain.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findAllByOrderByCreatedAtDesc();
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
    List<Booking> findByPhoneOrderByCreatedAtDesc(String phone);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:keyword IS NULL OR b.name LIKE %:keyword% OR b.phone LIKE %:keyword% OR b.id LIKE %:keyword%) AND " +
           "(:status IS NULL OR b.status = :status) " +
           "ORDER BY b.createdAt DESC")
    Page<Booking> findByFilters(@Param("keyword") String keyword,
                                @Param("status") String status,
                                Pageable pageable);
}
