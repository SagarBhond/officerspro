package com.adminbackend.service;

import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.Module;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.repository.EntitlementRepository;
import com.adminbackend.repository.ModuleRepository;
import com.adminbackend.repository.RoleRepo;
import com.adminbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSetupService {
    private final UserRepository userRepo;
    private final RoleRepo roleRepo;
    private final ModuleRepository moduleRepo;
    private final EntitlementRepository entRepo;

    public void assignDefaultPermissionsToAdmin(String adminEmail) {
        User admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Role adminRole = roleRepo.findByName(RoleEnum.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

        List<com.adminbackend.entity.Module> modules = moduleRepo.findAll();
        long adminId = admin.getId();

        for (Module m : modules) {
            if (entRepo.findByUserAndModule(admin, m).isPresent()) continue;
            Entitlement e = new Entitlement();
            e.setUser(admin);
            e.setRole(adminRole);
            e.setModule(m);
            e.setModuleName(m.getName());
            // grant all
            e.setCanCreate(true);
            e.setCanRead(true);
            e.setCanUpdate(true);
            e.setCanDelete(true);
            e.setCanAssign(true);
            e.setCanView(true);
            e.setCreatedBy(adminId);
            e.setUpdatedBy(adminId);
            entRepo.save(e);
        }
        System.out.println("✅ Default permissions assigned to Admin (" + adminEmail + ")");
    }
}
