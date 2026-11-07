package com.camp.controller;

import com.camp.domain.Activity;
import com.camp.domain.ActivitySignup;
import com.camp.domain.Booking;
import com.camp.domain.Zone;
import com.camp.dto.ActivitySignupRequest;
import com.camp.dto.ApiResponse;
import com.camp.dto.BookingRequest;
import com.camp.dto.FeedbackRequest;
import com.camp.repository.ActivityRepository;
import com.camp.repository.ActivitySignupRepository;
import com.camp.repository.BookingRepository;
import com.camp.repository.ZoneRepository;
import com.camp.service.BookingService;
import com.camp.service.CampPublicDataService;
import com.camp.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PublicController {

    private final CampPublicDataService publicDataService;
    private final BookingService bookingService;
    private final FeedbackService feedbackService;
    private final ZoneRepository zoneRepository;
    private final ActivityRepository activityRepository;
    private final ActivitySignupRepository activitySignupRepository;
    private final BookingRepository bookingRepository;

    public PublicController(CampPublicDataService publicDataService,
                             BookingService bookingService,
                             FeedbackService feedbackService,
                             ZoneRepository zoneRepository,
                             ActivityRepository activityRepository,
                             ActivitySignupRepository activitySignupRepository,
                             BookingRepository bookingRepository) {
        this.publicDataService = publicDataService;
        this.bookingService = bookingService;
        this.feedbackService = feedbackService;
        this.zoneRepository = zoneRepository;
        this.activityRepository = activityRepository;
        this.activitySignupRepository = activitySignupRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/public")
    public ApiResponse<Map<String, Object>> getPublicData() {
        return ApiResponse.success(publicDataService.getPublicDataset());
    }

    // ========== 微信小程序专用公开 API ==========

    @GetMapping("/public/zones")
    public ApiResponse<List<Zone>> getZones() {
        return ApiResponse.success(zoneRepository.findAll());
    }

    @GetMapping("/public/activities")
    public ApiResponse<List<Activity>> getActivities() {
        return ApiResponse.success(activityRepository.findAll());
    }

    @PostMapping("/public/activities/signup")
    public ResponseEntity<ApiResponse<?>> signupActivity(@Valid @RequestBody ActivitySignupRequest request) {
        // 检查活动是否存在
        var activityOpt = activityRepository.findById(request.getActivityId());
        if (activityOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "活动不存在"));
        }
        var activity = activityOpt.get();

        // 检查名额
        if (activity.getJoined() >= activity.getQuota()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "活动名额已满"));
        }

        // 检查是否已报名（用 openid 或 name+phone 去重）
        String openid = request.getOpenid();
        if (openid != null && !openid.isBlank()) {
            if (activitySignupRepository.existsByActivityIdAndOpenid(request.getActivityId(), openid)) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "您已报名该活动"));
            }
        }

        // 创建报名记录
        ActivitySignup signup = new ActivitySignup();
        signup.setId("as" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        signup.setActivityId(request.getActivityId());
        signup.setOpenid(openid != null ? openid : "");
        signup.setName(request.getName());
        signup.setPhone(request.getPhone());
        signup.setCreatedAt(LocalDateTime.now());

        // 更新活动已报名数
        activity.setJoined(activity.getJoined() + 1);
        activityRepository.save(activity);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(activitySignupRepository.save(signup)));
    }

    @GetMapping("/public/bookings/query")
    public ApiResponse<List<Booking>> queryBookings(@RequestParam String phone) {
        return ApiResponse.success(bookingRepository.findByPhoneOrderByCreatedAtDesc(phone));
    }

    @GetMapping("/public/activities/signups")
    public ApiResponse<List<ActivitySignup>> querySignups(@RequestParam(required = false) String openid,
                                                           @RequestParam(required = false) String phone) {
        if (openid != null && !openid.isBlank()) {
            return ApiResponse.success(activitySignupRepository.findByOpenidOrderByCreatedAtDesc(openid));
        }
        return ApiResponse.success(List.of());
    }

    // ========== 原有 API ==========

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<?>> createBooking(@Valid @RequestBody BookingRequest request) {
        var booking = bookingService.create(
            request.getName(), request.getPhone(), request.getZone(),
            LocalDate.parse(request.getDate()), request.getPeople(), request.getRemark()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(booking));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<?>> createFeedback(@Valid @RequestBody FeedbackRequest request) {
        var item = feedbackService.create(request.getName(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }
}
