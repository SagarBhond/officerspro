package com.configserver.officerspro.dashboardservice.controller;

import com.configserver.officerspro.dashboardservice.audit.APIRequestLogRequestDTO;
import com.configserver.officerspro.dashboardservice.audit.HttpMethodType;
import com.configserver.officerspro.dashboardservice.client.AuditClient;
import com.configserver.officerspro.dashboardservice.dto.DashboardCaseDTO;
import com.configserver.officerspro.dashboardservice.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard Management", description = "Dashboard statistics and case management APIs")
//@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final AuditClient auditClient;
    
    @GetMapping("/total")
    @Operation(summary = "Get total cases count", description = "Returns the total number of registered FIRs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved total cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getTotalCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/total");
            long count = dashboardService.getTotalCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning total cases count: {}", count);
            
            // Log to audit service
            logAPIRequest(request, "/admin/total", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getTotalCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/total", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get active cases count", description = "Returns the count of active/in-progress FIRs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved active cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getActiveCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/active");
            long count = dashboardService.getActiveCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning active cases count: {}", count);
            
            logAPIRequest(request, "/admin/active", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getActiveCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/active", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/completed")
    @Operation(summary = "Get completed cases count", description = "Returns the count of completed/closed FIRs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved completed cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getCompletedCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/completed");
            long count = dashboardService.getCompletedCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning completed cases count: {}", count);
            
            logAPIRequest(request, "/admin/completed", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getCompletedCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/completed", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/statements")
    @Operation(summary = "Get statements count", description = "Returns the total count of written complaints/statements")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statements count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getStatements(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/statements");
            long count = dashboardService.getStatementsCount();
            response = String.valueOf(count);
            log.info("✅ Returning statements count: {}", count);
            
            logAPIRequest(request, "/admin/statements", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getStatements", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/statements", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/fir-cases")
    @Operation(summary = "Get FIR cases count", description = "Returns the count of FIR cases")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved FIR cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getFirCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/fir-cases");
            long count = dashboardService.getFirCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning FIR cases count: {}", count);
            
            logAPIRequest(request, "/admin/fir-cases", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getFirCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/fir-cases", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/nc-cases")
    @Operation(summary = "Get NC cases count", description = "Returns the count of Non-Cognizable cases")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved NC cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getNcCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/nc-cases");
            long count = dashboardService.getNcCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning NC cases count: {}", count);
            
            logAPIRequest(request, "/admin/nc-cases", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getNcCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/nc-cases", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/closed-cases")
    @Operation(summary = "Get closed cases count", description = "Returns the count of closed/resolved cases")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved closed cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getClosedCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/closed-cases");
            long count = dashboardService.getClosedCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning closed cases count: {}", count);
            
            logAPIRequest(request, "/admin/closed-cases", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getClosedCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/closed-cases", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/transferred-cases")
    @Operation(summary = "Get transferred cases count", description = "Returns the count of transferred/forwarded cases")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transferred cases count"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> getTransferredCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        String response = "0";
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/transferred-cases");
            long count = dashboardService.getTransferredCasesCount();
            response = String.valueOf(count);
            log.info("✅ Returning transferred cases count: {}", count);
            
            logAPIRequest(request, "/admin/transferred-cases", HttpMethodType.GET, null, response, responseCode, startTime);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error in getTransferredCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/transferred-cases", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body("0");
        }
    }
    
    @GetMapping("/all")
    @Operation(summary = "Get all cases", description = "Returns list of all cases with details for dashboard display")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved all cases"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<DashboardCaseDTO>> getAllCases(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        int responseCode = 200;
        
        try {
            log.info("🔍 API called: GET /admin/all");
            List<DashboardCaseDTO> cases = dashboardService.getAllCases();
            log.info("✅ Returning {} cases", cases.size());
            
            String responseBody = cases.size() + " cases returned";
            logAPIRequest(request, "/admin/all", HttpMethodType.GET, null, responseBody, responseCode, startTime);
            
            return ResponseEntity.ok(cases);
        } catch (Exception e) {
            log.error("❌ Error in getAllCases", e);
            responseCode = 500;
            logAPIRequest(request, "/admin/all", HttpMethodType.GET, null, "Error: " + e.getMessage(), responseCode, startTime);
            return ResponseEntity.internalServerError().body(List.of());
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if dashboard service is running")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service is healthy")
    })
    public ResponseEntity<String> healthCheck(HttpServletRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("🔍 Health check called");
        String response = "Dashboard Service is running on port 8093";
        
        logAPIRequest(request, "/admin/health", HttpMethodType.GET, null, response, 200, startTime);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Helper method to log API requests to audit service
     */
    private void logAPIRequest(HttpServletRequest request, String endpoint, HttpMethodType method, 
                               String requestBody, String responseBody, int responseCode, long startTime) {
        try {
            long executionTime = System.currentTimeMillis() - startTime;
            String ipAddress = getClientIP(request);
            
            APIRequestLogRequestDTO auditLog = APIRequestLogRequestDTO.builder()
                .userId(null) // Can be set from JWT token if available
                .endpointUrl(endpoint)
                .httpMethod(method)
                .ipAddress(ipAddress)
                .macAddress(null) // MAC address typically not available in HTTP requests
                .requestBody(requestBody)
                .responseCode(responseCode)
                .responseBody(responseBody)
                .executionTimeMs(executionTime)
                .build();
            
            auditClient.logAPIRequest(auditLog);
            log.debug("✅ Audit log sent for endpoint: {}", endpoint);
        } catch (Exception e) {
            log.error("❌ Failed to send audit log for endpoint: {} - {}", endpoint, e.getMessage());
            // Don't throw exception, just log it - audit failure shouldn't break the API
        }
    }
    
    /**
     * Extract client IP address from request
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
