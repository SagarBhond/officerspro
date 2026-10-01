package com.adminbackend.service;

import com.adminbackend.dto.EntitlementDto;
import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.Module;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.repository.EntitlementRepository;
import com.adminbackend.repository.ModuleRepository;
import com.adminbackend.repository.RoleRepo;
import com.adminbackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EntitlementService {

    @Autowired
    private RoleRepo roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private EntitlementRepository entitlementRepository;

    public List<EntitlementDto> saveOrUpdateEntitlements(List<EntitlementDto> entitlements, Long userId) {
        List<EntitlementDto> responseList = new ArrayList<>();

        // ✅ Get current user's role
        RoleEnum currentUserRole = getCurrentUserRole(userId);
        System.out.println("🔐 Current User Role: " + currentUserRole);

        // ✅ Get current user object
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("❌ User not found with ID: " + userId));

        for (EntitlementDto dto : entitlements) {
            Optional<Role> targetRoleOpt = roleRepository.findById(dto.getRoleId());
            if (!targetRoleOpt.isPresent()) {
                throw new RuntimeException("❌ Target role not found for ID: " + dto.getRoleId());
            }

            Role targetRole = targetRoleOpt.get();
            RoleEnum targetRoleEnum = targetRole.getName();

            if (currentUserRole == RoleEnum.ADMIN) {
                // No restrictions
            } else if (currentUserRole == RoleEnum.MANAGER) {
                if (targetRoleEnum == RoleEnum.ADMIN || targetRoleEnum == RoleEnum.MANAGER) {
                    throw new RuntimeException("❌ Managers can only assign permissions to USER role.");
                }
            } else {
                throw new RuntimeException("❌ Users are not allowed to assign any permissions.");
            }

            //Module module = moduleRepository.findByNameIgnoreCase(dto.getModuleName());
            Module module = moduleRepository.findByNameIgnoreCase(dto.getModuleName());
            if (module == null) {
                module = new Module();
                module.setName(dto.getModuleName());
                module.setDescription("Auto-created");
                module = moduleRepository.save(module);
            }


            Optional<Entitlement> existing = entitlementRepository.findByUserAndModule(user, module);

            Entitlement ent = existing.orElseGet(Entitlement::new);
            ent.setUser(user);
            ent.setRole(targetRole);
            ent.setModule(module);
            ent.setCanCreate(dto.isCanCreate());
            ent.setCanRead(dto.isCanRead());
            ent.setCanUpdate(dto.isCanUpdate());
            ent.setCanDelete(dto.isCanDelete());
            ent.setCanAssign(dto.isCanAssign());
            ent.setCanView(dto.isCanView());
            ent.setCreatedBy(userId);
            ent.setUpdatedBy(userId);

            entitlementRepository.save(ent);

            EntitlementDto responseDto = new EntitlementDto();
            responseDto.setRoleId(targetRole.getId());
            responseDto.setModuleName(module.getName());
            responseDto.setCanCreate(ent.isCanCreate());
            responseDto.setCanRead(ent.isCanRead());
            responseDto.setCanUpdate(ent.isCanUpdate());
            responseDto.setCanDelete(ent.isCanDelete());
            responseDto.setCanAssign(ent.isCanAssign());
            responseDto.setCanView(ent.isCanView());
            responseDto.setCreatedBy(ent.getCreatedBy());
            responseDto.setUpdatedBy(ent.getUpdatedBy());

            responseList.add(responseDto);
        }

        return responseList;
    }

    private RoleEnum getCurrentUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("❌ User not found with ID: " + userId));

        return user.getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("❌ User has no role assigned"));
    }

    public List<EntitlementDto> saveOrUpdateEntitlementsForUsers(
            List<EntitlementDto> entitlements,
            List<Long> userIds,
            Long creatorId
    ) {
        List<EntitlementDto> responseList = new ArrayList<>();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("❌ User not found with ID: " + userId));

            Role targetRole = user.getRoles().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("❌ Role not assigned to user ID: " + userId));

            for (EntitlementDto dto : entitlements) {
                Module module = moduleRepository.findByNameIgnoreCase(dto.getModuleName());
                if (module == null) {
                    module = new Module();
                    module.setName(dto.getModuleName());
                    module.setDescription("Auto-created");
                    module = moduleRepository.save(module);
                }

                Optional<Entitlement> existing = entitlementRepository.findByUserAndModule(user, module);

                Entitlement entitlement = existing.orElseGet(Entitlement::new);
                entitlement.setUser(user);
                entitlement.setRole(targetRole);
                entitlement.setModule(module);
                entitlement.setModuleName(module.getName());
                entitlement.setCanCreate(dto.isCanCreate());
                entitlement.setCanRead(dto.isCanRead());
                entitlement.setCanUpdate(dto.isCanUpdate());
                entitlement.setCanDelete(dto.isCanDelete());
                entitlement.setCanAssign(dto.isCanAssign());
                entitlement.setCanView(dto.isCanView());
                entitlement.setCreatedBy(creatorId);
                entitlement.setUpdatedBy(creatorId);

                entitlementRepository.save(entitlement);

                EntitlementDto responseDto = new EntitlementDto();
                responseDto.setRoleId(targetRole.getId());
                responseDto.setModuleName(module.getName());
                responseDto.setCanCreate(entitlement.isCanCreate());
                responseDto.setCanRead(entitlement.isCanRead());
                responseDto.setCanUpdate(entitlement.isCanUpdate());
                responseDto.setCanDelete(entitlement.isCanDelete());
                responseDto.setCanAssign(entitlement.isCanAssign());
                responseDto.setCanView(entitlement.isCanView());
                responseDto.setCreatedBy(entitlement.getCreatedBy());
                responseDto.setUpdatedBy(entitlement.getUpdatedBy());
                responseDto.setUserId(user.getId());

                responseList.add(responseDto);
            }
        }

        return responseList;
    }

    public List<EntitlementDto> getEntitlementsByUserId(Long userId) {
        System.out.println("Fetching for userId = " + userId);
        List<Entitlement> entitlements = entitlementRepository.findByUserId(userId);
        System.out.println("Fetched entitlements: " + entitlements.size());

        return entitlements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    public List<EntitlementDto> getEntitlementsCreatedByAdmin(Long adminId) {
        System.out.println("Fetching entitlements created by adminId = " + adminId);
        List<Entitlement> entitlements = entitlementRepository.findByCreatedBy(adminId);
        System.out.println("Fetched entitlements: " + entitlements.size());

        return entitlements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private EntitlementDto convertToDto(Entitlement entitlement) {
        EntitlementDto dto = new EntitlementDto();
        dto.setRoleId(entitlement.getRole().getId());
        dto.setUserId(entitlement.getUser().getId()); // ✅ Add this
        dto.setModuleName(entitlement.getModule().getName());
        dto.setCanCreate(entitlement.isCanCreate());
        dto.setCanRead(entitlement.isCanRead());
        dto.setCanUpdate(entitlement.isCanUpdate());
        dto.setCanDelete(entitlement.isCanDelete());
        dto.setCanAssign(entitlement.isCanAssign());
        dto.setCanView(entitlement.isCanView());
        dto.setCreatedBy(entitlement.getCreatedBy());
        dto.setUpdatedBy(entitlement.getUpdatedBy());
        return dto;
    }
    @Transactional
    public void deleteEntitlementByUserAndModule(Long userId, String moduleName) {
        Module module = moduleRepository.findByNameIgnoreCase(moduleName);
        if (module == null) {
            throw new RuntimeException("❌ Module not found: " + moduleName);
        }

        entitlementRepository.findByUserIdAndModuleId(userId, module.getId())
                .ifPresentOrElse(
                        entitlementRepository::delete,
                        () -> System.out.println("⚠️ Entitlement not found for deletion.")
                );
    }
    public EntitlementDto assignModulePermissionToUser(Long userId, String moduleName, EntitlementDto permissions, Long creatorId) {
        // 1. Fetch User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Fetch Module
        Module module = moduleRepository.findByNameIgnoreCase(moduleName);
        if (module == null) {
            throw new RuntimeException("Module not found: " + moduleName);
        }

        // 3. Check if Entitlement already exists
        Optional<Entitlement> existingEntitlementOpt = entitlementRepository.findByUserAndModule(user, module);

        Entitlement entitlement;
        if (existingEntitlementOpt.isPresent()) {
            // 4. Update existing record
            entitlement = existingEntitlementOpt.get();
        } else {
            // 5. Create new entitlement
            entitlement = new Entitlement();
            entitlement.setUser(user);
            entitlement.setModule(module);
            entitlement.setCreatedBy(creatorId);
        }

        // 6. Set permissions
        entitlement.setCanCreate(permissions.isCanCreate());
        entitlement.setCanRead(permissions.isCanRead());
        entitlement.setCanUpdate(permissions.isCanUpdate());
        entitlement.setCanDelete(permissions.isCanDelete());
        entitlement.setCanAssign(permissions.isCanAssign());
        entitlement.setCanView(permissions.isCanView());

        // 7. Set updatedBy
        entitlement.setUpdatedBy(creatorId);

        // 8. Save to DB
        Entitlement savedEntitlement = entitlementRepository.save(entitlement);

        // 9. Convert to DTO (you can use ModelMapper or manually map)
        EntitlementDto dto = new EntitlementDto();
        dto.setUserId(user.getId());
        Integer roleId = user.getRoles().stream()
                .findFirst()
                .map(Role::getId)
                .orElse(null); // or throw exception if role is required


        dto.setRoleId(roleId);
        dto.setModuleName(module.getName());
        dto.setCanCreate(savedEntitlement.isCanCreate());
        dto.setCanRead(savedEntitlement.isCanRead());
        dto.setCanUpdate(savedEntitlement.isCanUpdate());
        dto.setCanDelete(savedEntitlement.isCanDelete());
        dto.setCanAssign(savedEntitlement.isCanAssign());
        dto.setCanView(savedEntitlement.isCanView());
        dto.setCreatedBy(savedEntitlement.getCreatedBy());
        dto.setUpdatedBy(savedEntitlement.getUpdatedBy());

        return dto;
    }
    public boolean hasPermission(Long userId, String moduleName, String permissionType) {
        Module module = moduleRepository.findByNameIgnoreCase(moduleName);
        if (module == null) return false;

        Optional<Entitlement> optEntitlement = entitlementRepository.findByUserIdAndModuleId(userId, module.getId());
        if (optEntitlement.isEmpty()) return false;

        Entitlement entitlement = optEntitlement.get();

        return switch (permissionType.toLowerCase()) {
            case "create" -> entitlement.isCanCreate();
            case "read" -> entitlement.isCanRead();
            case "update" -> entitlement.isCanUpdate();
            case "delete" -> entitlement.isCanDelete();
            case "assign" -> entitlement.isCanAssign();
            case "view" -> entitlement.isCanView();
            default -> false;
        };
    }


}


