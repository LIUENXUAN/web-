package com.camp.dto;

import jakarta.validation.constraints.NotBlank;

public class InspectionRequest {
    @NotBlank
    private String title;
    private String zone;
    private String owner;
    private String frequency;
    private String dueDate;
    @NotBlank
    private String status;
    private String result;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}
