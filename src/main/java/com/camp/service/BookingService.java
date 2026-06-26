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

    public Optional<Booking> updateStatus(String id, String status, String operator) {
        return bookings.findById(id).map(booking -> {
            String oldStatus = booking.getStatus();
            booking.setStatus(status);
            Booking saved = bookings.save(booking);
            // 记录操作日志
            OperationLog log = new OperationLog(null, operator, "更新预订状态",
                "Booking", id, oldStatus + " → " + status, LocalDateTime.now());
            logs.save(log);
            return saved;
        });
    }
}
