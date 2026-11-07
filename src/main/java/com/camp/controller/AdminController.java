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
    private final OperationLogRepository logs;

    public AdminController(ZoneRepository zones, ActivityRepository activities,
                            BookingRepository bookings, FeedbackRepository feedback,
                            CampAssetRepository assets, InspectionRepository inspections,
                            AlertRepository alerts, OperationLogRepository logs) {
        this.zones = zones;
        this.activities = activities;
        this.bookings = bookings;
        this.feedback = feedback;
        this.assets = assets;
        this.inspections = inspections;
        this.alerts = alerts;
        this.logs = logs;
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
        data.put("logs", logs.findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, 50)).getContent());
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
        m.put("bookings", totalBookings);
        m.put("pendingItems", feedback.countByStatus("待处理") + alerts.countByStatus("待处理"));
        return m;
    }
}