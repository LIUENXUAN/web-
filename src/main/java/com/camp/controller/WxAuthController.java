package com.camp.controller;

import com.camp.config.WxProperties;
import com.camp.domain.UserAccount;
import com.camp.dto.ApiResponse;
import com.camp.repository.UserAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/wx")
public class WxAuthController {

    private final WxProperties wxProperties;
    private final UserAccountRepository userRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    public WxAuthController(WxProperties wxProperties, UserAccountRepository userRepo) {
        this.wxProperties = wxProperties;
        this.userRepo = userRepo;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "code 不能为空"));
        }

        // 调用微信接口获取 openid
        String url = "https://api.weixin.qq.com/sns/jscode2session?appid="
            + wxProperties.getAppid() + "&secret=" + wxProperties.getSecret()
            + "&js_code=" + code + "&grant_type=authorization_code";

        try {
            Map<String, Object> wxResp = restTemplate.getForObject(url, Map.class);
            if (wxResp == null || wxResp.containsKey("errcode")) {
                String errMsg = wxResp != null ? String.valueOf(wxResp.get("errmsg")) : "微信登录失败";
                return ResponseEntity.badRequest().body(ApiResponse.error(400, errMsg));
            }

            String openid = (String) wxResp.get("openid");
            if (openid == null || openid.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "获取 openid 失败"));
            }

            // 查找或创建用户
            Optional<UserAccount> existing = userRepo.findByUsername("wx_" + openid);
            UserAccount user;
            if (existing.isPresent()) {
                user = existing.get();
            } else {
                user = new UserAccount();
                user.setId("u" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                user.setUsername("wx_" + openid);
                user.setPasswordHash("");
                user.setRole("USER");
                user.setStatus("ACTIVE");
                user.setDisplayName("微信用户");
                userRepo.save(user);
            }

            // 用 openid 作为简易 token（生产环境应使用 JWT）
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "openid", openid,
                "token", openid,
                "username", user.getDisplayName()
            )));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(500, "微信登录异常: " + e.getMessage()));
        }
    }
}
