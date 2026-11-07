package com.camp.controller;

import com.camp.domain.UserAccount;
import com.camp.dto.PageResponse;
import com.camp.dto.UserRequest;
import com.camp.repository.UserAccountRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public PageResponse<UserAccount> list(Pageable pageable) {
        Page<UserAccount> page = userRepo.findAll(pageable);
        return PageResponse.of(page);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody UserRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        UserAccount u = new UserAccount();
        u.setId("u" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        u.setUsername(req.getUsername());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRole(req.getRole());
        u.setStatus(req.getStatus());
        u.setDisplayName(req.getDisplayName());
        u.setEmail(req.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepo.save(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody UserRequest req) {
        return userRepo.findById(id).map(u -> {
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            }
            u.setRole(req.getRole());
            u.setStatus(req.getStatus());
            u.setDisplayName(req.getDisplayName());
            u.setEmail(req.getEmail());
            return ResponseEntity.ok(userRepo.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
