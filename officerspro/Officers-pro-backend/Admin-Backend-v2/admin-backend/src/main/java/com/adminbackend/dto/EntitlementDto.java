package com.adminbackend.dto;

import lombok.Data;

@Data
public class EntitlementDto {
    private Integer roleId;
    private Long userId;
    private String moduleName;

    private boolean canCreate;
    private boolean canRead;
    private boolean canUpdate;
    private boolean canDelete;
    private boolean canAssign;
    private boolean canView;

    private Long createdBy;
    private Long updatedBy;
}
