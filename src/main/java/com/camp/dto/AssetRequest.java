package com.camp.dto;

import jakarta.validation.constraints.NotBlank;

public class AssetRequest {
    @NotBlank
    private String name;
    private String zone;
    private String type;
    @NotBlank
    private String status;
    private String priority;
    private int health;
    private String owner;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public int getHealth() { return health; }
    public void setHealth(int health) { this.health = health; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
}
