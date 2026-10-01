package com.configserver.officerspro.courtcasemanagementservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MockCourtDataService {

    private static final Logger log = LoggerFactory.getLogger(MockCourtDataService.class);
    
    private Map<String, Object> mockData;
    
    public MockCourtDataService() {
        loadMockData();
    }
    
    private void loadMockData() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ClassPathResource resource = new ClassPathResource("mock-court-data.json");
            mockData = mapper.readValue(resource.getInputStream(), Map.class);
            log.info("Mock court data loaded successfully");
        } catch (IOException e) {
            log.error("Failed to load mock court data", e);
            mockData = Map.of();
        }
    }
    
    /**
     * Get court tracking details by FIR ID
     */
    public Map<String, Object> getTrackingByFirId(String firId) {
        List<Map<String, Object>> tracking = (List<Map<String, Object>>) mockData.get("tracking");
        if (tracking == null) return null;
        
        return tracking.stream()
                .filter(t -> firId.equals(t.get("firId")))
                .findFirst()
                .orElse(null);
    }
    
    /**
     * Get all hearings for a court tracking ID
     */
    public List<Map<String, Object>> getHearingsByTrackingId(String courtTrackingId) {
        List<Map<String, Object>> hearings = (List<Map<String, Object>>) mockData.get("hearings");
        if (hearings == null) return List.of();
        
        return hearings.stream()
                .filter(h -> courtTrackingId.equals(h.get("courtTrackingId")))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all judgments for a court tracking ID
     */
    public List<Map<String, Object>> getJudgmentsByTrackingId(String courtTrackingId) {
        List<Map<String, Object>> judgments = (List<Map<String, Object>>) mockData.get("judgments");
        if (judgments == null) return List.of();
        
        return judgments.stream()
                .filter(j -> courtTrackingId.equals(j.get("courtTrackingId")))
                .collect(Collectors.toList());
    }
}
