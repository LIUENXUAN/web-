package com.camp.controller;

import com.camp.domain.Alert;
import com.camp.domain.CampAsset;
import com.camp.domain.Inspection;
import com.camp.dto.ApiResponse;
import com.camp.repository.AlertRepository;
import com.camp.repository.CampAssetRepository;
import com.camp.repository.InspectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final CampAssetRepository assetRepo;
    private final InspectionRepository inspectionRepo;
    private final AlertRepository alertRepo;

    public EmployeeController(CampAssetRepository assetRepo,
                               InspectionRepository inspectionRepo,
                               AlertRepository alertRepo) {
        this.assetRepo = assetRepo;
        this.inspectionRepo = inspectionRepo;
        this.alertRepo = alertRepo;
    }

    @GetMapping("/assets")
    public ResponseEntity<?> listAssets() {
        return ResponseEntity.ok(ApiResponse.success(assetRepo.findAll()));
    }

    @PostMapping("/assets")
    public ResponseEntity<?> createAsset(@RequestBody Map<String, String> body) {
        CampAsset a = new CampAsset();
        a.setId("ca" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        a.setName(body.getOrDefault("name", ""));
        a.setZone(body.getOrDefault("zone", ""));
        a.setType(body.getOrDefault("type", ""));
        a.setStatus(body.getOrDefault("status", "正常"));
        a.setPriority(body.getOrDefault("priority", "低"));
        a.setHealth(Integer.parseInt(body.getOrDefault("health", "100")));
        a.setOwner(body.getOrDefault("owner", ""));
        return ResponseEntity.ok(ApiResponse.success(assetRepo.save(a)));
    }

    @PutMapping("/assets/{id}/status")
    public ResponseEntity<?> updateAssetStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return assetRepo.findById(id).map(a -> {
            a.setStatus(body.getOrDefault("status", a.getStatus()));
            a.setHealth(Integer.parseInt(body.getOrDefault("health", String.valueOf(a.getHealth()))));
            assetRepo.save(a);
            return ResponseEntity.ok(ApiResponse.success(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inspections")
    public ResponseEntity<?> listInspections() {
        return ResponseEntity.ok(ApiResponse.success(inspectionRepo.findAll()));
    }

    @PostMapping("/inspections")
    public ResponseEntity<?> createInspection(@RequestBody Map<String, String> body) {
        Inspection i = new Inspection();
        i.setId("i" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        i.setTitle(body.getOrDefault("title", ""));
        i.setZone(body.getOrDefault("zone", ""));
        i.setOwner(body.getOrDefault("owner", ""));
        i.setFrequency(body.getOrDefault("frequency", "每日"));
        i.setStatus(body.getOrDefault("status", "待执行"));
        i.setResult(body.getOrDefault("result", ""));
        String due = body.get("dueDate");
        if (due != null && !due.isEmpty()) i.setDueDate(LocalDate.parse(due));
        return ResponseEntity.ok(ApiResponse.success(inspectionRepo.save(i)));
    }

    @PutMapping("/inspections/{id}/status")
    public ResponseEntity<?> updateInspectionStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return inspectionRepo.findById(id).map(i -> {
            i.setStatus(body.getOrDefault("status", i.getStatus()));
            if (body.containsKey("result")) i.setResult(body.get("result"));
            inspectionRepo.save(i);
            return ResponseEntity.ok(ApiResponse.success(i));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> listAlerts() {
        return ResponseEntity.ok(ApiResponse.success(alertRepo.findAll()));
    }

    @PostMapping("/alerts")
    public ResponseEntity<?> createAlert(@RequestBody Map<String, String> body) {
        Alert a = new Alert();
        a.setId("al" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        a.setTitle(body.getOrDefault("title", ""));
        a.setZone(body.getOrDefault("zone", ""));
        a.setLevel(body.getOrDefault("level", "中"));
        a.setType(body.getOrDefault("type", "设备"));
        a.setStatus("待处理");
        a.setOwner(body.getOrDefault("owner", ""));
        a.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.success(alertRepo.save(a)));
    }

    @PutMapping("/alerts/{id}/status")
    public ResponseEntity<?> updateAlertStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return alertRepo.findById(id).map(a -> {
            a.setStatus(body.getOrDefault("status", a.getStatus()));
            if (body.containsKey("owner")) a.setOwner(body.get("owner"));
            alertRepo.save(a);
            return ResponseEntity.ok(ApiResponse.success(a));
        }).orElse(ResponseEntity.notFound().build());
    }
}
