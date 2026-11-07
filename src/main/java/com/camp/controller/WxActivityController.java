package com.camp.controller;

import com.camp.domain.Activity;
import com.camp.domain.ActivitySignup;
import com.camp.dto.ApiResponse;
import com.camp.repository.ActivityRepository;
import com.camp.repository.ActivitySignupRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wx")
public class WxActivityController {

    private final ActivityRepository activityRepo;
    private final ActivitySignupRepository signupRepo;

    public WxActivityController(ActivityRepository activityRepo,
                                 ActivitySignupRepository signupRepo) {
        this.activityRepo = activityRepo;
        this.signupRepo = signupRepo;
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

    /** 报名活动 */
    @PostMapping("/activities/{id}/signup")
    public ResponseEntity<?> signup(@PathVariable String id,
                                     @RequestBody Map<String, String> body) {
        String openid = body.get("openid");
        String name = body.get("name");
        String phone = body.get("phone");

        if (openid == null || openid.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "openid 不能为空"));
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
        if (signupRepo.existsByActivityIdAndOpenid(id, openid)) {
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
        signup.setOpenid(openid);
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
        String openid = body.get("openid");
        if (openid == null || openid.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "openid 不能为空"));
        }

        ActivitySignup signup = signupRepo.findByActivityIdAndOpenid(id, openid).orElse(null);
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
    public ResponseEntity<?> mySignups(@RequestParam String openid) {
        if (openid == null || openid.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "openid 不能为空"));
        }
        List<ActivitySignup> signups = signupRepo.findByOpenidOrderByCreatedAtDesc(openid);
        return ResponseEntity.ok(ApiResponse.success(signups));
    }
}
