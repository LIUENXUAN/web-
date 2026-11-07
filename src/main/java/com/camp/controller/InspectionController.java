package com.camp.controller;

import com.camp.domain.Inspection;
import com.camp.dto.InspectionRequest;
import com.camp.dto.PageResponse;
import com.camp.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inspections")
public class InspectionController {

    private final AdminService adminService;

    public InspectionController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping
    public PageResponse<Inspection> list(Pageable pageable) {
        return PageResponse.of(adminService.listInspections(pageable));
    }

    @PostMapping
    public ResponseEntity<Inspection> create(@Valid @RequestBody InspectionRequest req) {
        Inspection i = new Inspection();
        i.setId("i" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        i.setTitle(req.getTitle());
        i.setZone(req.getZone());
        i.setOwner(req.getOwner());
        i.setFrequency(req.getFrequency());
        i.setDueDate(req.getDueDate() != null ? LocalDate.parse(req.getDueDate()) : null);
        i.setStatus(req.getStatus());
        i.setResult(req.getResult());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createInspection(i));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody InspectionRequest req) {
        Inspection i = new Inspection();
        i.setTitle(req.getTitle());
        i.setZone(req.getZone());
        i.setOwner(req.getOwner());
        i.setFrequency(req.getFrequency());
        i.setDueDate(req.getDueDate() != null ? LocalDate.parse(req.getDueDate()) : null);
        i.setStatus(req.getStatus());
        i.setResult(req.getResult());
        return adminService.updateInspection(id, i)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return adminService.updateInspectionStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminService.deleteInspection(id);
        return ResponseEntity.noContent().build();
    }
}
