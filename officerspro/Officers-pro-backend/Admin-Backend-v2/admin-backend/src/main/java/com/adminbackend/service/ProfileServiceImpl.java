package com.adminbackend.service;

import com.adminbackend.dto.ProfileDto;
import com.adminbackend.dto.UpdateProfileRequest;
import com.adminbackend.dto.UserDto;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    @Override
    public Object getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email;

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDto userDto) {
            email = userDto.getEmail();
        } else {
            email = authentication.getName();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoleEnum role = user.getRoles().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Role not found"))
                .getName();

        return switch (role) {
            case ADMIN -> getAdminProfile(user);
            case MANAGER -> getManagerProfile(user);
            case USER -> getUserProfile(user);
            default -> throw new RuntimeException("Invalid role");
        };
    }

    private ProfileDto getAdminProfile(User user) {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())  // ✅ Renamed lambda variable to avoid conflict
                .orElse(null);

        return ProfileDto.builder()
                //.name(user.getFirstName() + " " + user.getLastName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobile("5678654387")
                .role(role) // ✅ This 'role' is now safe to use
                .profilePicture(user.getProfilePicture())
                .registrationDate(LocalDate.now()) // Ideally should come from DB
                .lastLogin(LocalDateTime.now())     // Replace with real login time
                .totalManagers(userRepository.countByRole(RoleEnum.MANAGER))
                .totalUsers(userRepository.countByRole(RoleEnum.USER))
                .totalOfficers(userRepository.countByRole(RoleEnum.OFFICER))
                .build();
    }


    private ProfileDto getManagerProfile(User user)
    {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("UNKNOWN");

        String createdBy = (user.getCreatedBy() != null)
                ? user.getCreatedBy().getFirstName() + " " + user.getCreatedBy().getLastName()
                : "System";

        return ProfileDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .profilePicture(user.getProfilePicture())
                .registrationDate(LocalDate.now()) // Ideally: user.getCreatedAt().toLocalDate()
                .lastLogin(LocalDateTime.now())    // Ideally: user.getLastLogin()
                .department("IT")                  // TODO: Replace with actual value
                .assignedUsers(Collections.emptyList()) // TODO: Replace with actual value
                .role(role)
                .createdBy(createdBy)
                .build();
    }


    private ProfileDto getUserProfile(User user) {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("UNKNOWN");

        String createdBy = (user.getCreatedBy() != null)
                ? user.getCreatedBy().getFirstName() + " " + user.getCreatedBy().getLastName()
                : "System";

        return ProfileDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .profilePicture(user.getProfilePicture())
                .registrationDate(LocalDate.now()) // Ideally: user.getCreatedAt().toLocalDate()
                .lastLogin(LocalDateTime.now())    // Ideally: user.getLastLogin()
                .currentPlan("Gold") // TODO: Replace with actual value
                .planStartDate(LocalDate.now())
                .planEndDate(LocalDate.now().plusMonths(1))
                .planHistory(Collections.emptyList())
                .managerName("Manager Name") // TODO: Replace with actual value
                .role(role)
                .createdBy(createdBy)
                .build();
    }

    public void updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Update only editable fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getMobile() != null) user.setMobile(request.getMobile());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        userRepository.save(user); // ✅ Save to DB
    }


}
