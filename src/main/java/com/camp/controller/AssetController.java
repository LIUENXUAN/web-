package com.camp.controller;

import com.camp.domain.CampAsset;
import com.camp.dto.AssetRequest;
import com.camp.dto.PageResponse;
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
@RequestMapping("/api/admin/assets")
public class AssetController {

    private final AdminService adminService;

    public AssetController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping
    public PageResponse<CampAsset> list(Pageable pageable) {
        return PageResponse.of(adminService.listAssets(pageable));
    }

    @PostMapping
    public ResponseEntity<CampAsset> create(@Valid @RequestBody AssetRequest req) {
        CampAsset a = new CampAsset();
        a.setId("ca" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        a.setName(req.getName());
        a.setZone(req.getZone());
        a.setType(req.getType());
        a.setStatus(req.getStatus());
        a.setPriority(req.getPriority());
        a.setHealth(req.getHealth());
        a.setOwner(req.getOwner());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAsset(a));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody AssetRequest req) {
        CampAsset a = new CampAsset();
        a.setName(req.getName());
        a.setZone(req.getZone());
        a.setType(req.getType());
        a.setStatus(req.getStatus());
        a.setPriority(req.getPriority());
        a.setHealth(req.getHealth());
        a.setOwner(req.getOwner());
        return adminService.updateAsset(id, a)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body, Principal principal) {
        return adminService.updateAssetStatus(id, body.get("status"), principal != null ? principal.getName() : "system")
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        adminService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
