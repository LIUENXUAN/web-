package com.camp.dto;

import jakarta.validation.constraints.NotBlank;

public class AlertRequest {
    @NotBlank
    private String title;
    private String zone;
    private String level;
    private String type;
    @NotBlank
    private String status;
    private String owner;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
}
