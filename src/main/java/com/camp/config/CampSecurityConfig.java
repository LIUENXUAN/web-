package com.camp.config;

import com.camp.domain.UserAccount;
import com.camp.repository.UserAccountRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.io.IOException;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class CampSecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final UserAccountRepository userRepo;

    public CampSecurityConfig(AuthenticationConfiguration authenticationConfiguration, UserAccountRepository userRepo) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.userRepo = userRepo;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/bloom-admin.html", "/model-test.html", "/visitor-portal.html", "/employee-portal.html").permitAll()
                .requestMatchers("/api/public", "/api/bookings", "/api/feedback", "/api/login", "/api/logout", "/api/register", "/api/wx/**", "/api/portal/**", "/api/employee/**").permitAll()
                .requestMatchers("/assets/**", "/admin/assets/**", "/console/**", "/app/**").permitAll()
                .requestMatchers("/vendor/**", "/node_modules/**", "/data/**", "/draco/**", "/fonts/**").permitAll()
                .requestMatchers("/favicon.ico", "/*.js", "/*.css", "/*.webmanifest", "/*.json").permitAll()
                .requestMatchers("/admin", "/admin/", "/admin/index.html", "/admin/*.js", "/admin/*.css").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().authenticated()
            )
            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            );

        JsonLoginFilter jsonFilter = new JsonLoginFilter();
        jsonFilter.setAuthenticationManager(authenticationConfiguration.getAuthenticationManager());
        jsonFilter.setSecurityContextRepository(new HttpSessionSecurityContextRepository());
        jsonFilter.setAuthenticationSuccessHandler(new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, org.springframework.security.core.Authentication authentication) throws IOException, jakarta.servlet.ServletException {
                response.setContentType("application/json;charset=utf-8");
                String username = authentication.getName();
                Optional<UserAccount> opt = userRepo.findByUsername(username);
                String role = "USER";
                String displayName = username;
                if (opt.isPresent()) {
                    role = opt.get().getRole();
                    displayName = opt.get().getDisplayName() != null ? opt.get().getDisplayName() : username;
                }
                response.getWriter().write("{\"code\":200,\"msg\":\"success\",\"data\":{\"username\":\"" + username + "\",\"role\":\"" + role + "\",\"displayName\":\"" + displayName + "\"}}");
            }
        });
        jsonFilter.setAuthenticationFailureHandler((request, response, exception) -> {
            response.setContentType("application/json;charset=utf-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"code\":401,\"msg\":\"" + exception.getMessage() + "\"}");
        });

        http.addFilterAt(jsonFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}