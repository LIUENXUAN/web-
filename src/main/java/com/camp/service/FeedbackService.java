package com.camp.service;

import com.camp.domain.Feedback;
import com.camp.domain.OperationLog;
import com.camp.repository.FeedbackRepository;
import com.camp.repository.OperationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class FeedbackService {

    private final FeedbackRepository feedback;
    private final OperationLogRepository logs;

    public FeedbackService(FeedbackRepository feedback, OperationLogRepository logs) {
        this.feedback = feedback;
        this.logs = logs;
    }

    public Feedback create(String name, String content) {
        Feedback item = new Feedback();
        item.setId("f" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        item.setName(name == null || name.isBlank() ? "匿名游客" : name);
        item.setContent(content);
        item.setStatus("待处理");
        item.setCreatedAt(LocalDateTime.now());
        return feedback.save(item);
    }

    public Page<Feedback> list(Pageable pageable) {
        return feedback.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Optional<Feedback> updateStatus(String id, String status, String operator) {
        return feedback.findById(id).map(item -> {
            item.setStatus(status);
            Feedback saved = feedback.save(item);
            OperationLog log = new OperationLog(null, operator, "更新反馈状态",
                "Feedback", id, "状态: " + status, LocalDateTime.now());
            logs.save(log);
            return saved;
        });
    }

    public void delete(String id, String operator) {
        feedback.deleteById(id);
        OperationLog log = new OperationLog(null, operator, "删除反馈",
            "Feedback", id, "已删除", LocalDateTime.now());
        logs.save(log);
    }
}
