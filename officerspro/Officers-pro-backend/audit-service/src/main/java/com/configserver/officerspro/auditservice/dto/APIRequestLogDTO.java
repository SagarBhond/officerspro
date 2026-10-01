package com.configserver.officerspro.auditservice.dto;

import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class APIRequestLogDTO {

    private Long requestId;
    private Long userId;
    private String endpointUrl;
    private HttpMethodType httpMethod;
    private LocalDateTime requestTime;
    private String ipAddress;
    private String macAddress;
    private String requestBody;
    private Integer responseCode;
    private String responseBody;
    private Long executionTimeMs;
}
