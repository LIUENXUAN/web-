package com.camp.controller;

import com.camp.domain.Booking;
import com.camp.dto.PageResponse;
import com.camp.service.BookingService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) { this.bookingService = bookingService; }

    @GetMapping
    public PageResponse<Booking> list(@RequestParam(required = false) String keyword,
                                      @RequestParam(required = false) String status,
                                      Pageable pageable) {
        return PageResponse.of(bookingService.listWithFilters(keyword, status, pageable));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return bookingService.updateStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Principal principal) {
        bookingService.delete(id, principal != null ? principal.getName() : "system");
        return ResponseEntity.noContent().build();
    }
}