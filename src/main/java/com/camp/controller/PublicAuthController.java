package com.camp.controller;

import com.camp.domain.UserAccount;
import com.camp.dto.ApiResponse;
import com.camp.repository.UserAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PublicAuthController {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public PublicAuthController(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String phone = body.getOrDefault("phone", "").trim();
        String password = body.getOrDefault("password", "");

        if (username.isEmpty() || phone.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400,"用户名、手机号和密码不能为空"));
        }
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400,"手机号格式不正确"));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400,"密码至少6位"));
        }
        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400,"用户名已存在"));
        }
        if (userRepo.existsByPhone(phone)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400,"手机号已注册"));
        }

        UserAccount u = new UserAccount();
        u.setId("u" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        u.setUsername(username);
        u.setPhone(phone);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setRole("USER");
        u.setStatus("ACTIVE");
        u.setDisplayName(username);
        userRepo.save(u);

        return ResponseEntity.ok(ApiResponse.success(Map.of("username", username, "phone", phone)));
    }
}