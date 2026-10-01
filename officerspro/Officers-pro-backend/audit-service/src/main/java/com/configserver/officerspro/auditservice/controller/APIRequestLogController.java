package com.configserver.officerspro.auditservice.controller;

import com.configserver.officerspro.auditservice.dto.APIRequestLogDTO;
import com.configserver.officerspro.auditservice.dto.APIRequestLogRequestDTO;
import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import com.configserver.officerspro.auditservice.service.APIRequestLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "API Request Log", description = "API request logging APIs")
public class APIRequestLogController {

    private final APIRequestLogService apiRequestLogService;

    @PostMapping("/log")
    @Operation(summary = "Create new API request log entry")
    public ResponseEntity<APIRequestLogDTO> createAPIRequestLog(@RequestBody APIRequestLogRequestDTO requestDTO) {
        log.info("REST request to log API request for endpoint: {}", requestDTO.getEndpointUrl());
        APIRequestLogDTO apiRequestLogDTO = apiRequestLogService.createAPIRequestLog(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRequestLogDTO);
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all API request logs")
    public ResponseEntity<List<APIRequestLogDTO>> getAllAPIRequestLogs() {
        log.info("REST request to get all API request logs");
        List<APIRequestLogDTO> logs = apiRequestLogService.getAllAPIRequestLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/{requestId}")
    @Operation(summary = "Get API request log by ID")
    public ResponseEntity<APIRequestLogDTO> getAPIRequestLogById(@PathVariable Long requestId) {
        log.info("REST request to get API request log: {}", requestId);
        APIRequestLogDTO log = apiRequestLogService.getAPIRequestLogById(requestId);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/logs/user/{userId}")
    @Operation(summary = "Get API request logs by user ID")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByUserId(@PathVariable Long userId) {
        log.info("REST request to get API request logs for user: {}", userId);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByUserId(userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/endpoint")
    @Operation(summary = "Get API request logs by endpoint URL")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByEndpoint(@RequestParam String endpointUrl) {
        log.info("REST request to get API request logs for endpoint: {}", endpointUrl);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByEndpoint(endpointUrl);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/method/{httpMethod}")
    @Operation(summary = "Get API request logs by HTTP method")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByHttpMethod(@PathVariable HttpMethodType httpMethod) {
        log.info("REST request to get API request logs for HTTP method: {}", httpMethod);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByHttpMethod(httpMethod);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/date-range")
    @Operation(summary = "Get API request logs by date range")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("REST request to get API request logs between {} and {}", startDate, endDate);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByDateRange(startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/response-code/{responseCode}")
    @Operation(summary = "Get API request logs by response code")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByResponseCode(@PathVariable Integer responseCode) {
        log.info("REST request to get API request logs for response code: {}", responseCode);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByResponseCode(responseCode);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/logs/ip/{ipAddress}")
    @Operation(summary = "Get API request logs by IP address")
    public ResponseEntity<List<APIRequestLogDTO>> getAPIRequestLogsByIpAddress(@PathVariable String ipAddress) {
        log.info("REST request to get API request logs for IP: {}", ipAddress);
        List<APIRequestLogDTO> logs = apiRequestLogService.getAPIRequestLogsByIpAddress(ipAddress);
        return ResponseEntity.ok(logs);
    }
}
