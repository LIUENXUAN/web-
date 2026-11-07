package com.camp.service;

import com.camp.domain.Booking;
import com.camp.domain.OperationLog;
import com.camp.repository.BookingRepository;
import com.camp.repository.OperationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookings;
    private final OperationLogRepository logs;

    public BookingService(BookingRepository bookings, OperationLogRepository logs) {
        this.bookings = bookings;
        this.logs = logs;
    }

    public Booking create(String name, String phone, String zone, LocalDate date, int people, String remark) {
        Booking booking = new Booking();
        booking.setId("b" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        booking.setName(name);
        booking.setPhone(phone);
        booking.setZone(zone);
        booking.setDate(date);
        booking.setPeople(people);
        booking.setStatus("待确认");
        booking.setRemark(remark);
        booking.setCreatedAt(LocalDateTime.now());
        return bookings.save(booking);
    }

    public Page<Booking> list(Pageable pageable) {
        return bookings.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Booking> listWithFilters(String keyword, String status, Pageable pageable) {
        if ((keyword == null || keyword.isBlank()) && (status == null || status.isBlank())) {
            return bookings.findAllByOrderByCreatedAtDesc(pageable);
        }
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        String st = (status == null || status.isBlank()) ? null : status.trim();
        return bookings.findByFilters(kw, st, pageable);
    }

    public Optional<Booking> updateStatus(String id, String status, String operator) {
        return bookings.findById(id).map(booking -> {
            String oldStatus = booking.getStatus();
            booking.setStatus(status);
            Booking saved = bookings.save(booking);
            logs.save(new OperationLog(null, operator, "更新预订状态",
                "Booking", id, oldStatus + " → " + status, LocalDateTime.now()));
            return saved;
        });
    }

    public void delete(String id, String operator) {
        bookings.deleteById(id);
        logs.save(new OperationLog(null, operator, "删除预订",
            "Booking", id, "已删除", LocalDateTime.now()));
    }
}