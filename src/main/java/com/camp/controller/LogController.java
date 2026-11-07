package com.camp.controller;

import com.camp.domain.OperationLog;
import com.camp.dto.PageResponse;
import com.camp.service.AdminService;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/logs")
public class LogController {

    private final AdminService adminService;

    public LogController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping
    public PageResponse<OperationLog> list(Pageable pageable) {
        return PageResponse.of(adminService.listLogs(pageable));
    }
}
