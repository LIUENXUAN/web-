package com.camp.controller;

import com.camp.dto.ApiResponse;
import com.camp.dto.BookingRequest;
import com.camp.dto.FeedbackRequest;
import com.camp.service.BookingService;
import com.camp.service.CampPublicDataService;
import com.camp.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

    private final CampPublicDataService publicDataService;
    private final BookingService bookingService;
    private final FeedbackService feedbackService;

    public PublicController(CampPublicDataService publicDataService,
                             BookingService bookingService,
                             FeedbackService feedbackService) {
        this.publicDataService = publicDataService;
        this.bookingService = bookingService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("/public")
    public ApiResponse<Map<String, Object>> getPublicData() {
        return ApiResponse.success(publicDataService.getPublicDataset());
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<?>> createBooking(@Valid @RequestBody BookingRequest request) {
        var booking = bookingService.create(
            request.getName(), request.getPhone(), request.getZone(),
            LocalDate.parse(request.getDate()), request.getPeople(), request.getRemark()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(booking));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<?>> createFeedback(@Valid @RequestBody FeedbackRequest request) {
        var item = feedbackService.create(request.getName(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }
}
