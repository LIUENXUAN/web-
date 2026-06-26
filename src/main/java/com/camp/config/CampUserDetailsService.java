package com.camp.config;

import com.camp.domain.UserAccount;
import com.camp.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CampUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userRepo;

    public CampUserDetailsService(UserAccountRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        return User.builder()
            .username(account.getUsername())
            .password(account.getPasswordHash())
            .roles(account.getRole())
            .build();
    }
}
