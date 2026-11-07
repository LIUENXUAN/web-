package com.camp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class ActivityRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String date;
    private String zone;
    @Positive
    private int quota;
    @Positive
    private int joined;
    @NotBlank
    private String status;
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public int getQuota() { return quota; }
    public void setQuota(int quota) { this.quota = quota; }
    public int getJoined() { return joined; }
    public void setJoined(int joined) { this.joined = joined; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
