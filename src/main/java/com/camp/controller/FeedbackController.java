package com.camp.controller;

import com.camp.domain.Feedback;
import com.camp.dto.PageResponse;
import com.camp.service.FeedbackService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) { this.feedbackService = feedbackService; }

    @GetMapping
    public PageResponse<Feedback> list(Pageable pageable) {
        return PageResponse.of(feedbackService.list(pageable));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return feedbackService.updateStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Principal principal) {
        feedbackService.delete(id, principal != null ? principal.getName() : "system");
        return ResponseEntity.noContent().build();
    }
}
