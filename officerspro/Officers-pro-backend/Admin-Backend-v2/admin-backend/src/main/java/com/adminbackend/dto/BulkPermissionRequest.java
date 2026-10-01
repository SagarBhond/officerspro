package com.adminbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkPermissionRequest {
    private List<EntitlementDto> entitlements;
    private List<Long> userIds;
}
