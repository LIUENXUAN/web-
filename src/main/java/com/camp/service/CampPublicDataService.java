package com.camp.service;

import com.camp.domain.*;
import com.camp.repository.*;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class CampPublicDataService {

    private final ZoneRepository zones;
    private final ActivityRepository activities;
    private final BookingRepository bookings;
    private final FeedbackRepository feedback;
    private final AlertRepository alerts;

    public CampPublicDataService(ZoneRepository zones, ActivityRepository activities,
                                  BookingRepository bookings, FeedbackRepository feedback,
                                  AlertRepository alerts) {
        this.zones = zones;
        this.activities = activities;
        this.bookings = bookings;
        this.feedback = feedback;
        this.alerts = alerts;
    }

    public Map<String, Object> getPublicDataset() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("zones", zones.findAll());
        data.put("activities", activities.findAll());
        data.put("stats", getStats());
        return data;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalZones", zones.count());
        stats.put("availableZones", zones.findByStatus("开放").size());
        stats.put("totalBookings", bookings.count());
        stats.put("pendingBookings", bookings.countByStatus("待确认"));
        stats.put("confirmedBookings", bookings.countByStatus("已确认"));
        stats.put("pendingFeedback", feedback.countByStatus("待处理"));
        stats.put("pendingAlerts", alerts.countByStatus("待处理"));
        return stats;
    }
}