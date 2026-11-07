package com.camp.controller;

import com.camp.domain.Zone;
import com.camp.dto.PageResponse;
import com.camp.dto.ZoneRequest;
import com.camp.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/zones")
public class ZoneController {

    private final AdminService adminService;

    public ZoneController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping
    public PageResponse<Zone> list(Pageable pageable) {
        return PageResponse.of(adminService.listZones(pageable));
    }

    @PostMapping
    public ResponseEntity<Zone> create(@Valid @RequestBody ZoneRequest req) {
        Zone z = new Zone();
        z.setId("z" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        z.setName(req.getName());
        z.setType(req.getType());
        z.setCapacity(req.getCapacity());
        z.setPrice(req.getPrice());
        z.setStatus(req.getStatus());
        z.setDescription(req.getDescription());
        z.setImageUrl(req.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createZone(z));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody ZoneRequest req) {
        Zone z = new Zone();
        z.setName(req.getName());
        z.setType(req.getType());
        z.setCapacity(req.getCapacity());
        z.setPrice(req.getPrice());
        z.setStatus(req.getStatus());
        z.setDescription(req.getDescription());
        z.setImageUrl(req.getImageUrl());
        return adminService.updateZone(id, z)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return adminService.updateZoneStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }
}
