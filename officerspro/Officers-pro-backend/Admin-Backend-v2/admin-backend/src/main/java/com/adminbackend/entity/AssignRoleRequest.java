package com.adminbackend.entity;

import lombok.Data;

@Data
public class AssignRoleRequest {
    private Long userId;
    private String role; // ADMIN, MANAGER, USER
}
