package com.camp.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusRequest {
    @NotBlank(message = "状态不能为空")
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
