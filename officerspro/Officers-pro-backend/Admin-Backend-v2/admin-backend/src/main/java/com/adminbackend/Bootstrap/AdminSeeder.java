package com.adminbackend.Bootstrap;

import com.adminbackend.dto.SignUpDto;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.mapper.UserMapper;
import com.adminbackend.repository.RoleRepo;
import com.adminbackend.repository.UserRepository;
import com.adminbackend.service.AdminSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.CharBuffer;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Order(3)
public class AdminSeeder implements ApplicationListener<ContextRefreshedEvent> {

    private final RoleRepo roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AdminSetupService setupService;

    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {
        String adminEmail = "info@configserverllp.com";

        // 1) Ensure ADMIN role exists
        Optional<Role> roleOpt = roleRepository.findByName(RoleEnum.ADMIN);
        if (roleOpt.isEmpty()) {
            System.out.println("❌ No ADMIN role—skipping");
            return;
        }

        // 2) Skip if admin user already seeded
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            System.out.println("ℹ️ Admin already exists—skipping");
            return;
        }

        // 3) Create new Admin user
        SignUpDto dto = new SignUpDto();
        dto.setFirstName("Config Server");
        dto.setLastName("LLP");
        dto.setEmail(adminEmail);
        dto.setPassword("Green@9156..".toCharArray());

        User admin = userMapper.mapToUser(dto);
        admin.setPassword(passwordEncoder.encode(CharBuffer.wrap(dto.getPassword())));
        admin.setRoles(Set.of(roleOpt.get()));
        userRepository.save(admin);
        System.out.println("✅ Super‑admin created: " + adminEmail);

        // 4) Seed default permissions
        setupService.assignDefaultPermissionsToAdmin(adminEmail);
    }
}
