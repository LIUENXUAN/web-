package com.camp.controller;

import com.camp.domain.Alert;
import com.camp.dto.AlertRequest;
import com.camp.dto.PageResponse;
import com.camp.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/alerts")
public class AlertController {

    private final AdminService adminService;

    public AlertController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping
    public PageResponse<Alert> list(Pageable pageable) {
        return PageResponse.of(adminService.listAlerts(pageable));
    }

    @PostMapping
    public ResponseEntity<Alert> create(@Valid @RequestBody AlertRequest req) {
        Alert a = new Alert();
        a.setId("al" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        a.setTitle(req.getTitle());
        a.setZone(req.getZone());
        a.setLevel(req.getLevel());
        a.setType(req.getType());
        a.setStatus(req.getStatus());
        a.setOwner(req.getOwner());
        a.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAlert(a));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody AlertRequest req) {
        Alert a = new Alert();
        a.setTitle(req.getTitle());
        a.setZone(req.getZone());
        a.setLevel(req.getLevel());
        a.setType(req.getType());
        a.setStatus(req.getStatus());
        a.setOwner(req.getOwner());
        return adminService.updateAlert(id, a)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return adminService.updateAlertStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}
