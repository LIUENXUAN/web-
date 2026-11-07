package com.camp.controller;

import com.camp.domain.Activity;
import com.camp.dto.ActivityRequest;
import com.camp.dto.PageResponse;
import com.camp.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/activities")
public class ActivityController {

    private final AdminService adminService;
    private final com.camp.repository.ActivitySignupRepository signupRepo;

    public ActivityController(AdminService adminService, com.camp.repository.ActivitySignupRepository signupRepo) {
        this.adminService = adminService;
        this.signupRepo = signupRepo;
    }

    @GetMapping("/{id}/signups")
    public ResponseEntity<?> getSignups(@PathVariable String id) {
        List<com.camp.domain.ActivitySignup> signups = signupRepo.findByActivityId(id);
        return ResponseEntity.ok(com.camp.dto.ApiResponse.success(signups));
    }

    @GetMapping
    public PageResponse<Activity> list(Pageable pageable) {
        return PageResponse.of(adminService.listActivities(pageable));
    }

    @PostMapping
    public ResponseEntity<Activity> create(@Valid @RequestBody ActivityRequest req) {
        Activity a = new Activity();
        a.setId("a" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        a.setTitle(req.getTitle());
        a.setDate(LocalDate.parse(req.getDate()));
        a.setZone(req.getZone());
        a.setQuota(req.getQuota());
        a.setJoined(req.getJoined());
        a.setStatus(req.getStatus());
        a.setDescription(req.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createActivity(a));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody ActivityRequest req) {
        Activity a = new Activity();
        a.setTitle(req.getTitle());
        a.setDate(LocalDate.parse(req.getDate()));
        a.setZone(req.getZone());
        a.setQuota(req.getQuota());
        a.setJoined(req.getJoined());
        a.setStatus(req.getStatus());
        a.setDescription(req.getDescription());
        return adminService.updateActivity(id, a)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return adminService.updateActivityStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
