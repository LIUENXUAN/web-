package com.camp.controller;

import com.camp.domain.*;
import com.camp.dto.StatusRequest;
import com.camp.repository.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ZoneRepository zones;
    private final ActivityRepository activities;
    private final BookingRepository bookings;
    private final FeedbackRepository feedback;
    private final CampAssetRepository assets;
    private final InspectionRepository inspections;
    private final AlertRepository alerts;

    public AdminController(ZoneRepository zones, ActivityRepository activities,
                            BookingRepository bookings, FeedbackRepository feedback,
                            CampAssetRepository assets, InspectionRepository inspections,
                            AlertRepository alerts) {
        this.zones = zones;
        this.activities = activities;
        this.bookings = bookings;
        this.feedback = feedback;
        this.assets = assets;
        this.inspections = inspections;
        this.alerts = alerts;
    }

    @GetMapping("")
    public Map<String, Object> getAll() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metrics", getMetrics());
        data.put("zones", zones.findAll());
        data.put("bookings", bookings.findAllByOrderByCreatedAtDesc());
        data.put("activities", activities.findAll());
        data.put("feedback", feedback.findAllByOrderByCreatedAtDesc());
        data.put("assets", assets.findAll());
        data.put("inspections", inspections.findAll());
        data.put("alerts", alerts.findAll());
        return data;
    }

    private Map<String, Object> getMetrics() {
        Map<String, Object> m = new LinkedHashMap<>();
        long totalBookings = bookings.count();
        long totalZones = zones.count();
        long availableZones = zones.findByStatus("开放").size() + zones.findByStatus("可预订").size();
        m.put("visitors", totalBookings * 2 + 150);
        m.put("bookingRate", totalZones > 0 ? Math.round((double)(totalZones - availableZones) / totalZones * 100) : 0);
        m.put("revenue", totalBookings * 298 + 12000);
        m.put("assetHealth", 87);
        m.put("alertCloseRate", 92);
        m.put("avgOrderValue", 356);
        return m;
    }

    @PutMapping("/bookings/{id}")
    public Map<String, Object> updateBookingStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        bookings.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            bookings.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "预订不存在"));
        return result;
    }

    @PutMapping("/feedback/{id}")
    public Map<String, Object> updateFeedbackStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        feedback.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            feedback.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "反馈不存在"));
        return result;
    }

    @DeleteMapping("/feedback/{id}")
    public Map<String, Object> deleteFeedback(@PathVariable String id) {
        feedback.deleteById(id);
        return Map.of("ok", (Object)true);
    }

    @PutMapping("/zones/{id}")
    public Map<String, Object> updateZoneStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        zones.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            zones.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "营地不存在"));
        return result;
    }

    @PutMapping("/activities/{id}")
    public Map<String, Object> updateActivityStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        activities.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            activities.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "活动不存在"));
        return result;
    }

    @PutMapping("/assets/{id}")
    public Map<String, Object> updateAssetStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        assets.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            assets.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "资产不存在"));
        return result;
    }

    @PutMapping("/inspections/{id}")
    public Map<String, Object> updateInspectionStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        inspections.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            inspections.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "巡检不存在"));
        return result;
    }

    @PutMapping("/alerts/{id}")
    public Map<String, Object> updateAlertStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
        Map<String, Object> result = new HashMap<>();
        alerts.findById(id).ifPresentOrElse(item -> {
            item.setStatus(request.getStatus());
            alerts.save(item);
            result.put("ok", true);
        }, () -> result.put("error", "告警不存在"));
        return result;
    }
}
