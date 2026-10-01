package com.adminbackend.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * This DTO is used for returning user profile data for Admin, Manager, and User roles.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {

    // Common fields
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String profilePicture;
    private LocalDate registrationDate;
    private LocalDateTime lastLogin;

    // USER-Specific fields
    private String currentPlan;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private List<String> planHistory;
    private String managerName;

    // MANAGER-Specific fields
    private String department;
    private List<String> assignedUsers;

    // ADMIN-Specific fields
    private Integer totalManagers;
    private Integer totalUsers;
    private Integer totalOfficers;


    private String role;         // ✅ moved to common usage
    private String createdBy;    // ✅ used optionally for Admin/Manager

}
