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

        users.save(new UserAccount("u1", "admin", passwordEncoder.encode("camp2026"), "ADMIN", "ACTIVE"));

        zones.save(new Zone("z1", "星空营地", "帐篷", 20, "开放", new BigDecimal("298"), "开阔草地，夜间观星绝佳位置", null));
        zones.save(new Zone("z2", "森林木屋", "木屋", 10, "开放", new BigDecimal("598"), "林间木屋，配备独立卫浴", null));
        zones.save(new Zone("z3", "湖畔营位", "帐篷", 15, "开放", new BigDecimal("398"), "湖边营地，清晨可看日出", null));
        zones.save(new Zone("z4", "房车驿站", "房车", 8, "开放", new BigDecimal("458"), "水电桩齐全，适合房车停靠", null));
        zones.save(new Zone("z5", "山顶观景台", "帐篷", 12, "开放", new BigDecimal("358"), "山顶平台，360度全景视野", null));
        zones.save(new Zone("z6", "亲子乐园", "帐篷", 25, "开放", new BigDecimal("268"), "儿童游乐设施齐全，适合家庭", null));
        zones.save(new Zone("z7", "篝火广场", "公共", 50, "开放", new BigDecimal("128"), "大型篝火晚会场地", null));
        zones.save(new Zone("z8", "野餐花园", "公共", 30, "开放", new BigDecimal("88"), "户外野餐区，配备烧烤设施", null));
        zones.save(new Zone("z9", "竹林雅苑", "木屋", 6, "开放", new BigDecimal("698"), "竹林深处的精品木屋", null));
        zones.save(new Zone("z10", "溪边营地", "帐篷", 18, "维护中", new BigDecimal("328"), "溪水旁的宁静营地", null));

        activities.save(new Activity("a1", "篝火晚会", LocalDate.now().plusDays(1), "篝火广场", 50, 32, "报名中", null));
        activities.save(new Activity("a2", "星空观测", LocalDate.now().plusDays(2), "星空营地", 30, 18, "报名中", null));
        activities.save(new Activity("a3", "森林徒步", LocalDate.now().plusDays(3), "森林木屋", 20, 15, "报名中", null));
        activities.save(new Activity("a4", "亲子手工", LocalDate.now().plusDays(4), "亲子乐园", 40, 28, "报名中", null));
        activities.save(new Activity("a5", "日出瑜伽", LocalDate.now().plusDays(5), "山顶观景台", 15, 8, "报名中", null));

        bookings.save(new Booking("b1", "张三", "13800138001", "星空营地", LocalDate.now().plusDays(1), 3, "已确认", "想住靠近中心的位置", LocalDateTime.now().minusDays(2)));
        bookings.save(new Booking("b2", "李四", "13900139002", "森林木屋", LocalDate.now().plusDays(2), 2, "已确认", "需要安静的房间", LocalDateTime.now().minusDays(1)));
        bookings.save(new Booking("b3", "王五", "13700137003", "湖畔营位", LocalDate.now().plusDays(1), 4, "待确认", "自带帐篷", LocalDateTime.now()));
        bookings.save(new Booking("b4", "赵六", "13600136004", "房车驿站", LocalDate.now().plusDays(3), 2, "待确认", "房车尺寸6米", LocalDateTime.now()));
        bookings.save(new Booking("b5", "孙七", "13500135005", "亲子乐园", LocalDate.now().plusDays(2), 5, "已取消", "行程有变", LocalDateTime.now().minusDays(3)));

        feedback.save(new Feedback("f1", "陈先生", "环境非常好，下次还会再来！", "已处理", LocalDateTime.now().minusDays(5)));
        feedback.save(new Feedback("f2", "刘女士", "建议增加淋浴设施", "待处理", LocalDateTime.now().minusDays(1)));
        feedback.save(new Feedback("f3", "匿名游客", "篝火晚会太棒了，建议每周都办", "待处理", LocalDateTime.now()));

        assets.save(new CampAsset("ca1", "发电机A", "房车驿站", "设备", "正常", "高", LocalDate.now().minusDays(5), 95, "张工"));
        assets.save(new CampAsset("ca2", "水泵B", "湖畔营位", "设备", "正常", "中", LocalDate.now().minusDays(3), 88, "李工"));
        assets.save(new CampAsset("ca3", "照明系统", "篝火广场", "设施", "待维修", "高", LocalDate.now().minusDays(10), 45, "张工"));

        inspections.save(new Inspection("i1", "每日安全巡检", "星空营地", "王安全", "每日", LocalDate.now(), "已完成", "一切正常"));
        inspections.save(new Inspection("i2", "消防设备检查", "森林木屋", "王安全", "每周", LocalDate.now().plusDays(2), "待执行", ""));
        inspections.save(new Inspection("i3", "水质检测", "湖畔营位", "李工", "每日", LocalDate.now(), "已完成", "水质达标"));

        alerts.save(new Alert("al1", "照明系统故障", "篝火广场", "中", "设备故障", "处理中", LocalDateTime.now().minusHours(3), "张工"));
        alerts.save(new Alert("al2", "水位偏低", "湖畔营位", "低", "环境告警", "待处理", LocalDateTime.now().minusHours(1), ""));

        log.info("演示数据注入完成！共创建: 10个营地, 5个活动, 5条预订, 3条反馈, 3个资产, 3条巡检, 2条告警, 1个管理员");
    }
}