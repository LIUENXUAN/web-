package com.camp.dto;

import jakarta.validation.constraints.NotBlank;

public class FeedbackRequest {
    private String name;

    @NotBlank(message = "反馈内容不能为空")
    private String content;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
