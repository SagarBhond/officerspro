package com.adminbackend.dto; // or use 'dto' if that's your convention

import com.adminbackend.entity.RoleEnum;
import lombok.Data;

@Data
public class UserRoleRequest {
    private String email;
    private RoleEnum role;
}
