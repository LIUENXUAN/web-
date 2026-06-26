package com.camp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;

public class BookingRequest {
    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "请选择营地")
    private String zone;

    @NotBlank(message = "请选择日期")
    private String date;

    @Min(value = 1, message = "人数至少为1")
    private int people;

    private String remark;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public int getPeople() { return people; }
    public void setPeople(int people) { this.people = people; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
}
