package com.camp.controller;

import com.camp.domain.Activity;
import com.camp.domain.ActivitySignup;
import com.camp.domain.Booking;
import com.camp.domain.Feedback;
import com.camp.domain.UserAccount;
import com.camp.domain.Zone;
import com.camp.dto.ApiResponse;
import com.camp.repository.ActivityRepository;
import com.camp.repository.ActivitySignupRepository;
import com.camp.repository.BookingRepository;
import com.camp.repository.FeedbackRepository;
import com.camp.repository.UserAccountRepository;
import com.camp.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal")
public class UserPortalController {

    private final ActivityRepository activityRepo;
    private final ActivitySignupRepository signupRepo;
    private final ZoneRepository zoneRepo;
    private final BookingRepository bookingRepo;
    private final FeedbackRepository feedbackRepo;
    private final UserAccountRepository userRepo;

    public UserPortalController(ActivityRepository activityRepo,
                                 ActivitySignupRepository signupRepo,
                                 ZoneRepository zoneRepo,
                                 BookingRepository bookingRepo,
                                 FeedbackRepository feedbackRepo,
                                 UserAccountRepository userRepo) {
        this.activityRepo = activityRepo;
        this.signupRepo = signupRepo;
        this.zoneRepo = zoneRepo;
        this.bookingRepo = bookingRepo;
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
    }

    /** 获取所有活动课程 */
    @GetMapping("/activities")
    public ResponseEntity<?> listActivities() {
        List<Activity> activities = activityRepo.findAll();
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    /** 获取单个活动详情 */
    @GetMapping("/activities/{id}")
    public ResponseEntity<?> getActivity(@PathVariable String id) {
        return activityRepo.findById(id)
            .map(a -> ResponseEntity.ok(ApiResponse.success(a)))
            .orElse(ResponseEntity.notFound().build());
    }

    /** 报名活动（使用用户名） */
    @PostMapping("/activities/{id}/signup")
    public ResponseEntity<?> signup(@PathVariable String id,
                                     @RequestBody Map<String, String> body) {
        String username = body.get("username");
        String name = body.get("name");
        String phone = body.get("phone");

        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "用户名不能为空"));
        }
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "姓名不能为空"));
        }
        if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "手机号格式不正确"));
        }

        // 检查活动是否存在
        Activity activity = activityRepo.findById(id).orElse(null);
        if (activity == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(404, "活动不存在"));
        }

        // 检查是否已报名
        if (signupRepo.existsByActivityIdAndUsername(id, username)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "您已报名该活动"));
        }

        // 检查名额
        long signedUp = signupRepo.countByActivityId(id);
        if (signedUp >= activity.getQuota()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "活动名额已满"));
        }

        // 创建报名记录
        ActivitySignup signup = new ActivitySignup();
        signup.setId("s" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        signup.setActivityId(id);
        signup.setOpenid(username);
        signup.setUsername(username);
        signup.setName(name);
        signup.setPhone(phone);
        signup.setCreatedAt(LocalDateTime.now());
        signupRepo.save(signup);

        // 更新活动已报名数
        activity.setJoined((int) signedUp + 1);
        activityRepo.save(activity);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "signupId", signup.getId(),
            "joined", activity.getJoined()
        )));
    }

    /** 取消报名 */
    @DeleteMapping("/activities/{id}/signup")
    public ResponseEntity<?> cancelSignup(@PathVariable String id,
                                           @RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "用户名不能为空"));
        }

        ActivitySignup signup = signupRepo.findByActivityIdAndUsername(id, username).orElse(null);
        if (signup == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "未找到报名记录"));
        }

        signupRepo.delete(signup);

        // 更新活动已报名数
        activityRepo.findById(id).ifPresent(a -> {
            a.setJoined(Math.max(0, a.getJoined() - 1));
            activityRepo.save(a);
        });

        return ResponseEntity.ok(ApiResponse.success("取消成功"));
    }

    /** 我的报名列表 */
    @GetMapping("/my/signups")
    public ResponseEntity<?> mySignups(@RequestParam String username) {
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "用户名不能为空"));
        }
        List<ActivitySignup> signups = signupRepo.findByUsernameOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(ApiResponse.success(signups));
    }

    /** 获取所有营地区域 */
    @GetMapping("/zones")
    public ResponseEntity<?> listZones() {
        List<Zone> zones = zoneRepo.findAll();
        return ResponseEntity.ok(ApiResponse.success(zones));
    }

    /** 获取单个区域详情 */
    @GetMapping("/zones/{id}")
    public ResponseEntity<?> getZone(@PathVariable String id) {
        return zoneRepo.findById(id)
            .map(z -> ResponseEntity.ok(ApiResponse.success(z)))
            .orElse(ResponseEntity.notFound().build());
    }

    /** 提交反馈 */
    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String content = body.get("content");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "姓名不能为空"));
        }
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "反馈内容不能为空"));
        }

        Feedback fb = new Feedback();
        fb.setId("f" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        fb.setName(name);
        fb.setContent(content);
        fb.setStatus("待处理");
        fb.setCreatedAt(LocalDateTime.now());
        feedbackRepo.save(fb);

        return ResponseEntity.ok(ApiResponse.success(fb));
    }

    /** 我的预订记录 */
    @GetMapping("/my/bookings")
    public ResponseEntity<?> myBookings(@RequestParam String phone) {
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "手机号不能为空"));
        }
        List<Booking> bookings = bookingRepo.findByPhoneOrderByCreatedAtDesc(phone);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    /** 获取用户信息 */
    @GetMapping("/user/info")
    public ResponseEntity<?> userInfo(@RequestParam String username) {
        return userRepo.findByUsername(username)
            .map(u -> ResponseEntity.ok(ApiResponse.success(Map.of(
                "username", u.getUsername(),
                "phone", u.getPhone(),
                "displayName", u.getDisplayName()
            ))))
            .orElse(ResponseEntity.badRequest().body(ApiResponse.error(404, "用户不存在")));
    }
}
