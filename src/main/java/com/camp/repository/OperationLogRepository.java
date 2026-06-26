package com.camp.repository;

import com.camp.domain.OperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {
    List<OperationLog> findAllByOrderByCreatedAtDesc();
    Page<OperationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
