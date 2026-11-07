package com.camp.config;

import com.camp.domain.*;
import com.camp.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class CampDemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CampDemoDataSeeder.class);

    private final ZoneRepository zones;
    private final ActivityRepository activities;
    private final BookingRepository bookings;
    private final FeedbackRepository feedback;
    private final CampAssetRepository assets;
    private final InspectionRepository inspections;
    private final AlertRepository alerts;
    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;

    public CampDemoDataSeeder(ZoneRepository zones, ActivityRepository activities,
                               BookingRepository bookings, FeedbackRepository feedback,
                               CampAssetRepository assets, InspectionRepository inspections,
                               AlertRepository alerts, UserAccountRepository users,
                               PasswordEncoder passwordEncoder) {
        this.zones = zones;
        this.activities = activities;
        this.bookings = bookings;
        this.feedback = feedback;
        this.assets = assets;
        this.inspections = inspections;
        this.alerts = alerts;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (zones.count() > 0) {
            log.info("数据库已有数据，跳过演示数据注入");
            return;
        }
        log.info("开始注入演示数据...");

        users.save(new UserAccount("u1", "admin", "13800000000", passwordEncoder.encode("camp2026"), "ADMIN", "ACTIVE", "管理员", "admin@camp.com", null));
        users.save(new UserAccount("u2", "employee", "13900000001", passwordEncoder.encode("emp2026"), "EMPLOYEE", "ACTIVE", "员工小王", "emp@camp.com", null));

        zones.save(new Zone("z1", "湖畔豪华帐篷", "帐篷", 2, "开放", new BigDecimal("1899"), "特大号舒适床品，独立卫浴和热水淋浴", null));
        zones.save(new Zone("z2", "森林木屋套房", "木屋", 4, "开放", new BigDecimal("3299"), "两室一厅独立空间，全景落地窗和私人花园", null));
        zones.save(new Zone("z3", "至尊野奢帐篷", "帐篷", 2, "开放", new BigDecimal("4999"), "私人户外温泉池，270°全景落地窗", null));
        zones.save(new Zone("z4", "豪华房车别墅", "房车", 6, "开放", new BigDecimal("2599"), "超大全景天窗，独立客厅和卧室", null));

        activities.save(new Activity("a1", "篝火晚会", LocalDate.now().plusDays(1), "湖畔豪华帐篷", 50, 32, "报名中", null));
        activities.save(new Activity("a2", "星空观测", LocalDate.now().plusDays(2), "森林木屋套房", 30, 18, "报名中", null));
        activities.save(new Activity("a3", "森林徒步", LocalDate.now().plusDays(3), "至尊野奢帐篷", 20, 15, "报名中", null));
        activities.save(new Activity("a4", "亲子手工", LocalDate.now().plusDays(4), "豪华房车别墅", 40, 28, "报名中", null));
        activities.save(new Activity("a5", "日出瑜伽", LocalDate.now().plusDays(5), "森林木屋套房", 15, 8, "报名中", null));

        bookings.save(new Booking("b1", "张三", "13800138001", "森林木屋套房", LocalDate.now().plusDays(1), 3, "已确认", "想住靠近中心的位置", LocalDateTime.now().minusDays(2)));
        bookings.save(new Booking("b2", "李四", "13900139002", "至尊野奢帐篷", LocalDate.now().plusDays(2), 2, "已确认", "需要安静的房间", LocalDateTime.now().minusDays(1)));
        bookings.save(new Booking("b3", "王五", "13700137003", "至尊野奢帐篷", LocalDate.now().plusDays(1), 2, "待确认", "自带帐篷", LocalDateTime.now()));
        bookings.save(new Booking("b4", "赵六", "13600136004", "豪华房车别墅", LocalDate.now().plusDays(3), 6, "待确认", "房车尺寸6米", LocalDateTime.now()));
        bookings.save(new Booking("b5", "孙七", "13500135005", "豪华房车别墅", LocalDate.now().plusDays(2), 5, "已取消", "行程有变", LocalDateTime.now().minusDays(3)));

        feedback.save(new Feedback("f1", "陈先生", "环境非常好，下次还会再来！", "已处理", LocalDateTime.now().minusDays(5)));
        feedback.save(new Feedback("f2", "刘女士", "建议增加淋浴设施", "待处理", LocalDateTime.now().minusDays(1)));
        feedback.save(new Feedback("f3", "匿名游客", "篝火晚会太棒了，建议每周都办", "待处理", LocalDateTime.now()));

        assets.save(new CampAsset("ca1", "发电机A", "豪华房车别墅", "设备", "正常", "高", LocalDate.now().minusDays(5), 95, "张工"));
        assets.save(new CampAsset("ca2", "水泵B", "湖畔豪华帐篷", "设备", "正常", "中", LocalDate.now().minusDays(3), 88, "李工"));
        assets.save(new CampAsset("ca3", "照明系统", "湖畔豪华帐篷", "设施", "待维修", "高", LocalDate.now().minusDays(10), 45, "张工"));

        inspections.save(new Inspection("i1", "每日安全巡检", "森林木屋套房", "王安全", "每日", LocalDate.now(), "已完成", "一切正常"));
        inspections.save(new Inspection("i2", "消防设备检查", "至尊野奢帐篷", "王安全", "每周", LocalDate.now().plusDays(2), "待执行", ""));
        inspections.save(new Inspection("i3", "水质检测", "湖畔豪华帐篷", "李工", "每日", LocalDate.now(), "已完成", "水质达标"));

        alerts.save(new Alert("al1", "照明系统故障", "湖畔豪华帐篷", "中", "设备故障", "处理中", LocalDateTime.now().minusHours(3), "张工"));
        alerts.save(new Alert("al2", "水位偏低", "湖畔豪华帐篷", "低", "环境告警", "待处理", LocalDateTime.now().minusHours(1), ""));

        log.info("演示数据注入完成！共创建: 4个营地, 5个活动, 5条预订, 3条反馈, 3个资产, 3条巡检, 2条告警, 1个管理员");
    }
}
