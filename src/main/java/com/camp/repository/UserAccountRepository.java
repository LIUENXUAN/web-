package com.camp.repository;

import com.camp.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
    Optional<UserAccount> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<UserAccount> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
