package com.adminbackend.service;

import com.adminbackend.entity.CustomUserDetails;
import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.User;
import com.adminbackend.repository.EntitlementRepository;
import com.adminbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;


import java.util.ArrayList;


import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    private final EntitlementRepository entitlementRepository;

    private final AdminSetupService adminSetupService;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1️⃣ Fetch user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 2️⃣ If the user is admin and has no entitlements, assign defaults
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equalsIgnoreCase("ADMIN"));

        if (isAdmin) {
            List<Entitlement> existing = entitlementRepository.findByUserId(user.getId());
            if (existing.isEmpty()) {
                System.out.println("⚙️ Assigning default admin permissions...");
                // You can inject AdminSetupService and call method like:
                adminSetupService.assignDefaultPermissionsToAdmin(email);
            }
        }

        // 3️⃣ Reload entitlements (in case new ones were just assigned)
        List<Entitlement> entitlements = entitlementRepository.findByUserId(user.getId());
        System.out.println("🧪 Entitlements for user: " + user.getEmail() + " (ID: " + user.getId() + ")");
        if (entitlements.isEmpty()) {
            System.out.println("❌ No entitlements found for this user.");
        } else {
            entitlements.forEach(e -> {
                System.out.println("📦 Module: " + e.getModuleName() +
                        " | CREATE: " + e.isCanCreate() +
                        " | READ: " + e.isCanRead() +
                        " | UPDATE: " + e.isCanUpdate() +
                        " | DELETE: " + e.isCanDelete() +
                        " | ASSIGN: " + e.isCanAssign() +
                        " | VIEW: " + e.isCanView());
            });
        }

        // 4️⃣ Convert entitlements to authorities
        Set<SimpleGrantedAuthority> authorities = entitlements.stream()
                .flatMap(e -> {
                    String rawModule = e.getModuleName() != null ? e.getModuleName() : "UNKNOWN";
                    String module = rawModule.trim().replaceAll("\\s+", " ");
                    module = module.replaceAll(" :", ":").replaceAll(": ", ":");

                    String formattedModule = module.length() > 0
                            ? module.substring(0, 1).toUpperCase() + module.substring(1)
                            : "UNKNOWN";

                    List<SimpleGrantedAuthority> perms = new ArrayList<>();
                    if (e.isCanCreate()) perms.add(new SimpleGrantedAuthority(formattedModule + ":CREATE"));
                    if (e.isCanRead()) perms.add(new SimpleGrantedAuthority(formattedModule + ":READ"));
                    if (e.isCanUpdate()) perms.add(new SimpleGrantedAuthority(formattedModule + ":UPDATE"));
                    if (e.isCanDelete()) perms.add(new SimpleGrantedAuthority(formattedModule + ":DELETE"));
                    if (e.isCanAssign()) perms.add(new SimpleGrantedAuthority(formattedModule + ":ASSIGN"));
                    if (e.isCanView()) perms.add(new SimpleGrantedAuthority(formattedModule + ":VIEW"));

                    return perms.stream();
                })
                .collect(Collectors.toSet());

        // 5️⃣ Also add ROLE_ authorities
        user.getRoles().forEach(role ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()))
        );

        // 6️⃣ Print for debugging
        System.out.println("✅ Authorities for " + email + ":");
        authorities.forEach(auth -> System.out.println(" ➤ " + auth.getAuthority()));

        // 7️⃣ Return UserDetails
        return new CustomUserDetails(user, authorities);
    }

}
