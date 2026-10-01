package com.configserver.officerspro.auditservice.aspect;

import com.configserver.officerspro.auditservice.dto.APIRequestLogRequestDTO;
import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import com.configserver.officerspro.auditservice.service.APIRequestLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Aspect for automatically logging API requests
 * This can be enabled/disabled via configuration
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLoggingAspect {

    private final APIRequestLogService apiRequestLogService;
    private final ObjectMapper objectMapper;

    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.GetMapping)")
    public Object logAPIRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        HttpServletRequest request = getCurrentHttpRequest();

        if (request == null) {
            return joinPoint.proceed();
        }

        Object result = null;
        Integer responseCode = 200;
        String responseBody = null;

        try {
            result = joinPoint.proceed();
            responseBody = objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            responseCode = 500;
            responseBody = e.getMessage();
            throw e;
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;

            try {
                APIRequestLogRequestDTO logRequest = APIRequestLogRequestDTO.builder()
                        .userId(getUserIdFromRequest(request))
                        .endpointUrl(request.getRequestURI())
                        .httpMethod(HttpMethodType.valueOf(request.getMethod()))
                        .ipAddress(getClientIP(request))
                        .macAddress(null) // MAC address requires additional implementation
                        .requestBody(getRequestBody(joinPoint))
                        .responseCode(responseCode)
                        .responseBody(truncateResponse(responseBody))
                        .executionTimeMs(executionTime)
                        .build();

                apiRequestLogService.createAPIRequestLog(logRequest);
            } catch (Exception e) {
                log.error("Failed to log API request: {}", e.getMessage());
            }
        }

        return result;
    }

    private HttpServletRequest getCurrentHttpRequest() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        // Extract user ID from JWT token or session
        // This is a placeholder - implement based on your authentication mechanism
        String userIdHeader = request.getHeader("X-User-Id");
        return userIdHeader != null ? Long.parseLong(userIdHeader) : null;
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getRequestBody(ProceedingJoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                return objectMapper.writeValueAsString(args[0]);
            }
        } catch (Exception e) {
            log.warn("Could not serialize request body: {}", e.getMessage());
        }
        return null;
    }

    private String truncateResponse(String response) {
        if (response != null && response.length() > 5000) {
            return response.substring(0, 5000) + "... (truncated)";
        }
        return response;
    }
}
