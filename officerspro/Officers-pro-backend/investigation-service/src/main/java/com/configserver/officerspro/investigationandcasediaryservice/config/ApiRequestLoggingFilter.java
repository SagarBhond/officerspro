package com.configserver.officerspro.investigationandcasediaryservice.config;

import com.configserver.officerspro.investigationandcasediaryservice.audit.APIRequestLogRequestDTO;
import com.configserver.officerspro.investigationandcasediaryservice.audit.HttpMethodType;
import com.configserver.officerspro.investigationandcasediaryservice.client.AuditClient;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class ApiRequestLoggingFilter extends OncePerRequestFilter {

    private final AuditClient auditClient;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        String requestBody = new String(wrappedRequest.getContentAsByteArray());
        
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
            
            String responseBody = new String(wrappedResponse.getContentAsByteArray());
            long duration = System.currentTimeMillis() - startTime;
            
            // Get user info if available
            String userIdStr = request.getHeader("X-User-Id");
            Long userId = 1L; // Default user ID if not provided
            if (userIdStr != null && !userIdStr.isEmpty()) {
                try {
                    userId = Long.parseLong(userIdStr);
                } catch (NumberFormatException e) {
                    log.warn("Invalid user ID format in X-User-Id header: {}", userIdStr);
                }
            }
            
            // Log to audit service for important actions
            if (shouldLogToAuditTrail(request)) {
                try {
                    // Create API request log
                    APIRequestLogRequestDTO apiLog = APIRequestLogRequestDTO.builder()
                        .userId(userId)
                        .endpointUrl(request.getRequestURI())
                        .httpMethod(HttpMethodType.valueOf(request.getMethod()))
                        .ipAddress(request.getRemoteAddr())
                        .requestBody(requestBody)
                        .responseCode(wrappedResponse.getStatus())
                        .responseBody(responseBody.length() > 1000 ? responseBody.substring(0, 1000) + "..." : responseBody)
                        .executionTimeMs(duration)
                        .build();
                    
                    // Send to audit service
                    auditClient.logAPIRequest(apiLog);
                    log.debug("Logged API request to audit service: {} {}", request.getMethod(), request.getRequestURI());
                    
                } catch (Exception e) {
                    log.error("Failed to log API request to audit service", e);
                }
            }
            
            // Log the API request details at debug level
            if (log.isDebugEnabled()) {
                log.debug("API Request - Method: {}, Path: {}, Status: {}, Duration: {}ms",
                    request.getMethod(),
                    request.getRequestURI(),
                    wrappedResponse.getStatus(),
                    duration);
            }
            
            // Copy the response back to the original response
            wrappedResponse.copyBodyToResponse();
            
        } catch (Exception e) {
            log.error("Error processing request: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator") || 
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger") ||
               path.startsWith("/webjars");
    }
    
    private boolean shouldLogToAuditTrail(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Only log non-GET requests to audit trail
        if ("GET".equalsIgnoreCase(method)) {
            return false;
        }
        
        // Skip common non-business endpoints
        return !path.startsWith("/actuator") && 
               !path.startsWith("/v3/api-docs") &&
               !path.startsWith("/swagger") &&
               !path.startsWith("/webjars");
    }
    
    private Map<String, String> getHeadersInfo(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.put(headerName, request.getHeader(headerName));
        }
        return headers;
    }
}
