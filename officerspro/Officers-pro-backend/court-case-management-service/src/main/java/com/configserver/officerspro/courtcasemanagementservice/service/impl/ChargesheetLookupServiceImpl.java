package com.configserver.officerspro.courtcasemanagementservice.service.impl;

import com.configserver.officerspro.courtcasemanagementservice.client.ChargesheetServiceClient;
import com.configserver.officerspro.courtcasemanagementservice.dto.external.chargesheet.ChargesheetClientResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.ChargesheetSummaryResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.FirChargesheetResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.ChargesheetLookupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChargesheetLookupServiceImpl implements ChargesheetLookupService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChargesheetLookupServiceImpl.class);

    private final ChargesheetServiceClient chargesheetServiceClient;

    public ChargesheetLookupServiceImpl(ChargesheetServiceClient chargesheetServiceClient) {
        this.chargesheetServiceClient = chargesheetServiceClient;
    }

    @Override
    public List<FirChargesheetResponse> getFirChargesheets(String firId) {
        // Fetch only SUBMITTED chargesheets
        List<ChargesheetClientResponse> chargesheets = fetchChargesheets(firId);
        if (chargesheets.isEmpty()) {
            return Collections.emptyList();
        }

        // Group ALL chargesheets by FIR ID (not just the latest)
        Map<String, List<ChargesheetClientResponse>> groupedByFir = new LinkedHashMap<>();
        
        for (ChargesheetClientResponse cs : chargesheets) {
            String currentFirId = cs.getFirId();
            groupedByFir.computeIfAbsent(currentFirId, k -> new java.util.ArrayList<>()).add(cs);
        }

        // Sort each FIR's chargesheets by version number (descending - latest first)
        groupedByFir.values().forEach(list -> 
            list.sort((cs1, cs2) -> {
                Integer v1 = cs1.getVersionNumber() != null ? cs1.getVersionNumber() : 0;
                Integer v2 = cs2.getVersionNumber() != null ? cs2.getVersionNumber() : 0;
                return v2.compareTo(v1); // Descending order
            })
        );

        // Map to response with ALL chargesheets per FIR
        return groupedByFir.entrySet().stream()
                .map(entry -> mapFir(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }
    
    private boolean isNewer(ChargesheetClientResponse cs1, ChargesheetClientResponse cs2) {
        // First compare by version number
        Integer v1 = cs1.getVersionNumber() != null ? cs1.getVersionNumber() : 0;
        Integer v2 = cs2.getVersionNumber() != null ? cs2.getVersionNumber() : 0;
        
        if (!v1.equals(v2)) {
            return v1 > v2;
        }
        
        // If same version, compare by submission time
        if (cs1.getSubmittedAt() != null && cs2.getSubmittedAt() != null) {
            return cs1.getSubmittedAt().isAfter(cs2.getSubmittedAt());
        }
        
        // If no submission time, compare by creation time
        if (cs1.getCreatedAt() != null && cs2.getCreatedAt() != null) {
            return cs1.getCreatedAt().isAfter(cs2.getCreatedAt());
        }
        
        return false;
    }

    @Override
    public ChargesheetSummaryResponse getChargesheet(String chargesheetId) {
        try {
            ChargesheetClientResponse clientResponse = chargesheetServiceClient.getChargesheetDetails(chargesheetId);
            if (clientResponse == null) {
                LOGGER.warn("Chargesheet {} not found in chargesheet service", chargesheetId);
                return null;
            }
            
            // Only return if submitted
            if (!Boolean.TRUE.equals(clientResponse.getIsSubmitted())) {
                LOGGER.warn("Chargesheet {} is not submitted yet", chargesheetId);
                return null;
            }
            
            return mapChargesheet(clientResponse);
        } catch (Exception ex) {
            LOGGER.warn("Failed to fetch chargesheet {}: {}", chargesheetId, ex.getMessage());
            return null;
        }
    }

    private FirChargesheetResponse mapFir(String firId, List<ChargesheetClientResponse> chargesheets) {
        FirChargesheetResponse response = new FirChargesheetResponse();
        response.setFirId(firId);
        response.setChargesheets(
                chargesheets.stream()
                        .map(this::mapChargesheet)
                        .collect(Collectors.toList())
        );
        return response;
    }

    private ChargesheetSummaryResponse mapChargesheet(ChargesheetClientResponse source) {
        ChargesheetSummaryResponse summary = new ChargesheetSummaryResponse();
        summary.setChargesheetId(source.getChargesheetId());
        summary.setFerristId(source.getFerristId());
        summary.setFirId(source.getFirId());
        summary.setInvestigationId(source.getInvestigationId());
        summary.setVersionNumber(source.getVersionNumber());
        summary.setIsSubmitted(source.getIsSubmitted());
        summary.setCourtName(source.getCourtName());
        summary.setHearingDate(source.getHearingDate());
        summary.setRemarks(source.getRemarks());
        summary.setCreatedAt(source.getCreatedAt());
        summary.setSubmittedAt(source.getSubmittedAt());

        // Fetch the merged document ID
        Long documentId = fetchDocumentId(source.getChargesheetId());
        summary.setDocumentId(documentId);

        return summary;
    }

    private Long fetchDocumentId(String chargesheetId) {
        try {
            Map<String, Object> response = chargesheetServiceClient.getChargesheetDocumentId(chargesheetId);
            Object docIdObj = response.get("documentId");
            if (docIdObj != null) {
                if (docIdObj instanceof Number) {
                    return ((Number) docIdObj).longValue();
                } else {
                    return Long.parseLong(docIdObj.toString());
                }
            }
        } catch (Exception ex) {
            LOGGER.warn("Failed to fetch document ID for chargesheet {}: {}", chargesheetId, ex.getMessage());
        }
        return null;
    }

    private List<ChargesheetClientResponse> fetchChargesheets(String firId) {
        try {
            List<ChargesheetClientResponse> chargesheets;
            if (StringUtils.hasText(firId)) {
                // Fetch by FIR ID, only submitted
                chargesheets = chargesheetServiceClient.getChargesheetsByFir(firId, true);
            } else {
                // Fetch all, only submitted
                chargesheets = chargesheetServiceClient.getAllChargesheets(true);
            }
            
            // Filter to ensure only submitted chargesheets (double-check)
            return chargesheets.stream()
                    .filter(cs -> Boolean.TRUE.equals(cs.getIsSubmitted()))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            LOGGER.error("Failed to fetch chargesheets from remote service: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }
}
