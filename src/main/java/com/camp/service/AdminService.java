package com.camp.service;

import com.camp.domain.*;
import com.camp.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AdminService {

    private final ZoneRepository zones;
    private final ActivityRepository activities;
    private final CampAssetRepository assets;
    private final InspectionRepository inspections;
    private final AlertRepository alerts;
    private final OperationLogRepository logs;

    public AdminService(ZoneRepository zones, ActivityRepository activities,
                        CampAssetRepository assets, InspectionRepository inspections,
                        AlertRepository alerts, OperationLogRepository logs) {
        this.zones = zones;
        this.activities = activities;
        this.assets = assets;
        this.inspections = inspections;
        this.alerts = alerts;
        this.logs = logs;
    }

    public Optional<Zone> updateZoneStatus(String id, String status, String operator) {
        return zones.findById(id).map(zone -> {
            zone.setStatus(status);
            Zone saved = zones.save(zone);
            OperationLog log = new OperationLog(null, operator, "更新营地状态",
                "Zone", id, "状态: " + status, java.time.LocalDateTime.now());
            logs.save(log);
            return saved;
        });
    }

    public Optional<Activity> updateActivityStatus(String id, String status, String operator) {
        return activities.findById(id).map(activity -> {
            activity.setStatus(status);
            Activity saved = activities.save(activity);
            OperationLog log = new OperationLog(null, operator, "更新活动状态",
                "Activity", id, "状态: " + status, java.time.LocalDateTime.now());
            logs.save(log);
            return saved;
        });
    }

    public Page<Zone> listZones(Pageable pageable) { return zones.findAll(pageable); }
    public Page<Activity> listActivities(Pageable pageable) { return activities.findAll(pageable); }
    public Page<CampAsset> listAssets(Pageable pageable) { return assets.findAll(pageable); }
    public Page<Inspection> listInspections(Pageable pageable) { return inspections.findAll(pageable); }
    public Page<Alert> listAlerts(Pageable pageable) { return alerts.findAll(pageable); }
    public Page<OperationLog> listLogs(Pageable pageable) { return logs.findAllByOrderByCreatedAtDesc(pageable); }
}
