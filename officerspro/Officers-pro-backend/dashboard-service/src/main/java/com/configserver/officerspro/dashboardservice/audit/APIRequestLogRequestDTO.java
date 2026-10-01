package com.configserver.officerspro.dashboardservice.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class APIRequestLogRequestDTO {

    private Long userId;
    private String endpointUrl;
    private HttpMethodType httpMethod;
    private String ipAddress;
    private String macAddress;
    private String requestBody;
    private Integer responseCode;
    private String responseBody;
    private Long executionTimeMs;
}
