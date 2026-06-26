package com.camp.config;

public final class CampConstants {
    private CampConstants() {}

    // 营地状态
    public static final String ZONE_AVAILABLE = "可预订";
    public static final String ZONE_MAINTENANCE = "维护中";
    public static final String ZONE_FULL = "已满";

    // 预订状态
    public static final String BOOKING_PENDING = "待确认";
    public static final String BOOKING_CONFIRMED = "已确认";
    public static final String BOOKING_COMPLETED = "已完成";
    public static final String BOOKING_CANCELLED = "已取消";

    // 反馈状态
    public static final String FEEDBACK_PENDING = "待处理";
    public static final String FEEDBACK_HANDLED = "已处理";

    // 活动状态
    public static final String ACTIVITY_OPEN = "报名中";
    public static final String ACTIVITY_FULL = "已满";
    public static final String ACTIVITY_CLOSED = "已结束";

    // 告警级别
    public static final String ALERT_HIGH = "高";
    public static final String ALERT_MEDIUM = "中";
    public static final String ALERT_LOW = "低";
}
