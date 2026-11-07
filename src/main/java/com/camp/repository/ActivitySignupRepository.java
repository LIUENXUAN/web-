package com.camp.repository;

import com.camp.domain.ActivitySignup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ActivitySignupRepository extends JpaRepository<ActivitySignup, String> {
    List<ActivitySignup> findByOpenidOrderByCreatedAtDesc(String openid);
    List<ActivitySignup> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<ActivitySignup> findByActivityIdAndOpenid(String activityId, String openid);
    Optional<ActivitySignup> findByActivityIdAndUsername(String activityId, String username);
    long countByActivityId(String activityId);
    List<ActivitySignup> findByActivityId(String activityId);
    boolean existsByActivityIdAndOpenid(String activityId, String openid);
    boolean existsByActivityIdAndUsername(String activityId, String username);
}
