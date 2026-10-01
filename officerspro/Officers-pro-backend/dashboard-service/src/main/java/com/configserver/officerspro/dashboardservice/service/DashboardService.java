package com.configserver.officerspro.dashboardservice.service;

import com.configserver.officerspro.dashboardservice.client.ComplaintServiceClient;
import com.configserver.officerspro.dashboardservice.client.InvestigationServiceClient;
import com.configserver.officerspro.dashboardservice.dto.DashboardCaseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final ComplaintServiceClient complaintServiceClient;
    private final InvestigationServiceClient investigationServiceClient;
    
    public long getTotalCasesCount() {
        try {
            log.info("📊 Fetching total cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> stmt.get("hasFIR") != null && (Boolean) stmt.get("hasFIR"))
                .count();
            
            log.info("✅ Total cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching total cases count", e);
            return 0;
        }
    }
    
    public long getActiveCasesCount() {
        try {
            log.info("📊 Fetching active cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> {
                    Boolean hasFIR = (Boolean) stmt.get("hasFIR");
                    String status = (String) stmt.get("status");
                    return hasFIR != null && hasFIR && 
                           (status == null || 
                            !status.equalsIgnoreCase("CLOSED") && 
                            !status.equalsIgnoreCase("RESOLVED") &&
                            !status.equalsIgnoreCase("COMPLETED"));
                })
                .count();
            
            log.info("✅ Active cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching active cases count", e);
            return 0;
        }
    }
    
    public long getCompletedCasesCount() {
        try {
            log.info("📊 Fetching completed cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> {
                    Boolean hasFIR = (Boolean) stmt.get("hasFIR");
                    String status = (String) stmt.get("status");
                    return hasFIR != null && hasFIR && status != null && 
                           (status.equalsIgnoreCase("CLOSED") || 
                            status.equalsIgnoreCase("RESOLVED") ||
                            status.equalsIgnoreCase("COMPLETED"));
                })
                .count();
            
            log.info("✅ Completed cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching completed cases count", e);
            return 0;
        }
    }
    
    public long getStatementsCount() {
        try {
            log.info("📊 Fetching statements count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            long count = statements.size();
            log.info("✅ Statements count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching statements count", e);
            return 0;
        }
    }
    
    public long getFirCasesCount() {
        try {
            log.info("📊 Fetching FIR cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> stmt.get("hasFIR") != null && (Boolean) stmt.get("hasFIR"))
                .count();
            
            log.info("✅ FIR cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching FIR cases count", e);
            return 0;
        }
    }
    
    public long getNcCasesCount() {
        try {
            log.info("📊 Fetching NC cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> stmt.get("hasFIR") != null && !(Boolean) stmt.get("hasFIR"))
                .count();
            
            log.info("✅ NC cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching NC cases count", e);
            return 0;
        }
    }
    
    public long getClosedCasesCount() {
        try {
            log.info("📊 Fetching closed cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> {
                    Boolean hasFIR = (Boolean) stmt.get("hasFIR");
                    String status = (String) stmt.get("status");
                    return hasFIR != null && hasFIR && status != null && 
                           (status.equalsIgnoreCase("CLOSED") || 
                            status.equalsIgnoreCase("RESOLVED") ||
                            status.equalsIgnoreCase("COMPLETED"));
                })
                .count();
            
            log.info("✅ Closed cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching closed cases count", e);
            return 0;
        }
    }
    
    public long getTransferredCasesCount() {
        try {
            log.info("📊 Fetching transferred cases count");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            long count = statements.stream()
                .filter(stmt -> {
                    Boolean hasFIR = (Boolean) stmt.get("hasFIR");
                    String status = (String) stmt.get("status");
                    return hasFIR != null && hasFIR && status != null && 
                           (status.equalsIgnoreCase("TRANSFERRED") || 
                            status.equalsIgnoreCase("FORWARDED"));
                })
                .count();
            
            log.info("✅ Transferred cases count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("❌ Error fetching transferred cases count", e);
            return 0;
        }
    }
    
    @SuppressWarnings("unchecked")
    public List<DashboardCaseDTO> getAllCases() {
        try {
            log.info("📊 Fetching all cases for dashboard");
            Map<String, Object> response = complaintServiceClient.getAllStatements(0, 10000);
            List<Map<String, Object>> statements = extractContent(response);
            
            if (statements == null || statements.isEmpty()) {
                log.warn("⚠️ No statements found");
                return Collections.emptyList();
            }
            
            List<DashboardCaseDTO> cases = statements.stream()
                .filter(stmt -> stmt.get("hasFIR") != null && (Boolean) stmt.get("hasFIR"))
                .map(this::mapStatementToCase)
                .collect(Collectors.toList());
            
            log.info("✅ Fetched {} cases for dashboard", cases.size());
            return cases;
        } catch (Exception e) {
            log.error("❌ Error fetching all cases", e);
            return Collections.emptyList();
        }
    }
    
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractContent(Map<String, Object> response) {
        try {
            if (response == null) {
                return Collections.emptyList();
            }
            Object content = response.get("content");
            if (content instanceof List) {
                return (List<Map<String, Object>>) content;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("❌ Error extracting content from response", e);
            return Collections.emptyList();
        }
    }
    
    @SuppressWarnings("unchecked")
    private DashboardCaseDTO mapStatementToCase(Map<String, Object> statement) {
        try {
            String complaintId = (String) statement.getOrDefault("complaintId", "");
            String firNo = (String) statement.getOrDefault("firNo", "N/A");
            String description = (String) statement.getOrDefault("description", "No description");
            String status = (String) statement.getOrDefault("status", "IN_PROGRESS");
            Object createdOnObj = statement.get("createdOn");
            
            LocalDateTime createdOn = LocalDateTime.now();
            if (createdOnObj != null) {
                if (createdOnObj instanceof List) {
                    List<Integer> dateArray = (List<Integer>) createdOnObj;
                    if (dateArray.size() >= 3) {
                        createdOn = LocalDateTime.of(
                            dateArray.get(0), dateArray.get(1), dateArray.get(2),
                            dateArray.size() > 3 ? dateArray.get(3) : 0,
                            dateArray.size() > 4 ? dateArray.get(4) : 0
                        );
                    }
                } else if (createdOnObj instanceof String) {
                    createdOn = LocalDateTime.parse((String) createdOnObj);
                }
            }
            
            // Extract victim names
            String victimName = "N/A";
            Object victimNamesObj = statement.get("victimNames");
            if (victimNamesObj instanceof List) {
                List<String> victimNames = (List<String>) victimNamesObj;
                if (!victimNames.isEmpty()) {
                    victimName = String.join(", ", victimNames);
                }
            }
            
            // Extract offender names
            String offenderName = "N/A";
            Object offenderNamesObj = statement.get("offenderNames");
            if (offenderNamesObj instanceof List) {
                List<String> offenderNames = (List<String>) offenderNamesObj;
                if (!offenderNames.isEmpty()) {
                    offenderName = String.join(", ", offenderNames);
                }
            }
            
            // Determine case status
            String caseStatus = "in progress";
            if (status != null) {
                String statusLower = status.toLowerCase();
                if (statusLower.contains("closed") || statusLower.contains("resolved") || statusLower.contains("completed")) {
                    caseStatus = "completed";
                }
            }
            
            // Keep full description without truncation (matching crime description field size of 10000)
            String shortDescription = description != null ? description : "No description";
            
            return DashboardCaseDTO.builder()
                .victimName(victimName)
                .offenderName(offenderName)
                .firNo(firNo)
                .shortDescription(shortDescription)
                .caseStatus(caseStatus)
                .createdOn(createdOn)
                .complaintId(complaintId)
                .sections("")
                .build();
        } catch (Exception e) {
            log.error("❌ Error mapping statement to case", e);
            return null;
        }
    }
}
