package com.camp.service;

import com.camp.domain.*;
import com.camp.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
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

    // Zone
    public Page<Zone> listZones(Pageable pageable) { return zones.findAll(pageable); }
    public Zone createZone(Zone zone) { return zones.save(zone); }
    public Optional<Zone> updateZone(String id, Zone data) {
        return zones.findById(id).map(z -> {
            z.setName(data.getName());
            z.setType(data.getType());
            z.setCapacity(data.getCapacity());
            z.setPrice(data.getPrice());
            z.setStatus(data.getStatus());
            z.setDescription(data.getDescription());
            z.setImageUrl(data.getImageUrl());
            return zones.save(z);
        });
    }
    public Optional<Zone> updateZoneStatus(String id, String status, String operator) {
        return zones.findById(id).map(zone -> {
            zone.setStatus(status);
            Zone saved = zones.save(zone);
            logs.save(new OperationLog(null, operator, "更新营地状态",
                "Zone", id, "状态: " + status, LocalDateTime.now()));
            return saved;
        });
    }
    public void deleteZone(String id) { zones.deleteById(id); }

    // Activity
    public Page<Activity> listActivities(Pageable pageable) { return activities.findAll(pageable); }
    public Activity createActivity(Activity a) { return activities.save(a); }
    public Optional<Activity> updateActivity(String id, Activity data) {
        return activities.findById(id).map(a -> {
            a.setTitle(data.getTitle());
            a.setDate(data.getDate());
            a.setZone(data.getZone());
            a.setQuota(data.getQuota());
            a.setJoined(data.getJoined());
            a.setStatus(data.getStatus());
            a.setDescription(data.getDescription());
            return activities.save(a);
        });
    }
    public Optional<Activity> updateActivityStatus(String id, String status, String operator) {
        return activities.findById(id).map(a -> {
            a.setStatus(status);
            Activity saved = activities.save(a);
            logs.save(new OperationLog(null, operator, "更新活动状态",
                "Activity", id, "状态: " + status, LocalDateTime.now()));
            return saved;
        });
    }
    public void deleteActivity(String id) { activities.deleteById(id); }

    // Asset
    public Page<CampAsset> listAssets(Pageable pageable) { return assets.findAll(pageable); }
    public CampAsset createAsset(CampAsset a) { return assets.save(a); }
    public Optional<CampAsset> updateAsset(String id, CampAsset data) {
        return assets.findById(id).map(a -> {
            a.setName(data.getName());
            a.setZone(data.getZone());
            a.setType(data.getType());
            a.setStatus(data.getStatus());
            a.setPriority(data.getPriority());
            a.setHealth(data.getHealth());
            a.setOwner(data.getOwner());
            return assets.save(a);
        });
    }
    public Optional<CampAsset> updateAssetStatus(String id, String status, String operator) {
        return assets.findById(id).map(a -> {
            a.setStatus(status);
            CampAsset saved = assets.save(a);
            logs.save(new OperationLog(null, operator, "更新资产状态",
                "Asset", id, "状态: " + status, LocalDateTime.now()));
            return saved;
        });
    }
    public void deleteAsset(String id) { assets.deleteById(id); }

    // Inspection
    public Page<Inspection> listInspections(Pageable pageable) { return inspections.findAll(pageable); }
    public Inspection createInspection(Inspection i) { return inspections.save(i); }
    public Optional<Inspection> updateInspection(String id, Inspection data) {
        return inspections.findById(id).map(i -> {
            i.setTitle(data.getTitle());
            i.setZone(data.getZone());
            i.setOwner(data.getOwner());
            i.setFrequency(data.getFrequency());
            i.setDueDate(data.getDueDate());
            i.setStatus(data.getStatus());
            i.setResult(data.getResult());
            return inspections.save(i);
        });
    }
    public Optional<Inspection> updateInspectionStatus(String id, String status, String operator) {
        return inspections.findById(id).map(i -> {
            i.setStatus(status);
            Inspection saved = inspections.save(i);
            logs.save(new OperationLog(null, operator, "更新巡检状态",
                "Inspection", id, "状态: " + status, LocalDateTime.now()));
            return saved;
        });
    }
    public void deleteInspection(String id) { inspections.deleteById(id); }

    // Alert
    public Page<Alert> listAlerts(Pageable pageable) { return alerts.findAll(pageable); }
    public Alert createAlert(Alert a) { return alerts.save(a); }
    public Optional<Alert> updateAlert(String id, Alert data) {
        return alerts.findById(id).map(a -> {
            a.setTitle(data.getTitle());
            a.setZone(data.getZone());
            a.setLevel(data.getLevel());
            a.setType(data.getType());
            a.setStatus(data.getStatus());
            a.setOwner(data.getOwner());
            return alerts.save(a);
        });
    }
    public Optional<Alert> updateAlertStatus(String id, String status, String operator) {
        return alerts.findById(id).map(a -> {
            a.setStatus(status);
            Alert saved = alerts.save(a);
            logs.save(new OperationLog(null, operator, "更新告警状态",
                "Alert", id, "状态: " + status, LocalDateTime.now()));
            return saved;
        });
    }
    public void deleteAlert(String id) { alerts.deleteById(id); }

    // Logs
    public Page<OperationLog> listLogs(Pageable pageable) {
        return logs.findAllByOrderByCreatedAtDesc(pageable);
    }
}
