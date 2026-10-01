package com.configserver.officerspro.auditservice.entity;

import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_request_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class APIRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "endpoint_url", nullable = false, length = 500)
    private String endpointUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "http_method", nullable = false)
    private HttpMethodType httpMethod;

    @CreationTimestamp
    @Column(name = "request_time", nullable = false, updatable = false)
    private LocalDateTime requestTime;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "mac_address", length = 17)
    private String macAddress;

    @Column(name = "request_body", columnDefinition = "TEXT")
    private String requestBody;

    @Column(name = "response_code")
    private Integer responseCode;

    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;
}
