package com.configserver.officerspro.complainandfirservice.util;

import com.configserver.officerspro.complainandfirservice.repository.FIRRepository;
import com.configserver.officerspro.complainandfirservice.repository.WrittenComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.UUID;

/**
 * Generates string-based unique codes for entities required by ChargeSheet service
 * Format: {TYPE}_{STATE}_{CITY}_{YEAR}_{SEQUENCE}
 * Example: FIR_MH_PNE_2025_000123
 */
@Component
public class CodeGenerator {

    // Configuration - can be made configurable via properties
    private static final String STATE_CODE = "MH"; // Maharashtra
    private static final String CITY_CODE = "PNE"; // Pune
    
    @Autowired
    private WrittenComplaintRepository complaintRepository;
    
    @Autowired
    private FIRRepository firRepository;
    
    /**
     * Generate FIR code
     * @param sequence The numeric ID of the FIR
     * @return Formatted FIR code like FIR_MH_PNE_2025_000123
     */
    public String generateFirCode(Integer sequence) {
        return generateCode("FIR", sequence);
    }
    
    /**
     * Generate Complaint code
     * @param sequence The numeric ID of the complaint
     * @return Formatted complaint code like CMP_MH_PNE_2025_000123
     */
    public String generateComplaintCode(Integer sequence) {
        return generateCode("CMP", sequence);
    }
    
    /**
     * Generate Investigation code
     * @param sequence The numeric ID of the investigation
     * @return Formatted investigation code like INV_MH_PNE_2025_000789
     */
    public String generateInvestigationCode(Integer sequence) {
        return generateCode("INV", sequence);
    }
    
    /**
     * Generate Case code
     * @param sequence The numeric ID
     * @return Formatted case code like CASE_MH_PNE_2025_000123
     */
    public String generateCaseCode(Integer sequence) {
        return generateCode("CASE", sequence);
    }
    
    /**
     * Generate Evidence code
     * @param sequence The numeric ID
     * @return Formatted evidence code like EVD_MH_PNE_2025_0100
     */
    public String generateEvidenceCode(Integer sequence) {
        return generateCode("EVD", sequence);
    }
    
    /**
     * Generate Case Diary code
     * @param sequence The numeric ID
     * @return Formatted case diary code like CD_MH_PNE_2025_001
     */
    public String generateCaseDiaryCode(Integer sequence) {
        return generateCode("CD", sequence);
    }
    
    /**
     * Generic code generation method
     * @param type The type prefix (FIR, CMP, INV, etc.)
     * @param sequence The numeric sequence
     * @return Formatted code with underscores
     */
    private String generateCode(String type, Integer sequence) {
        int year = Year.now().getValue();
        String paddedSequence = String.format("%06d", sequence); // 6-digit zero-padded
        return String.format("%s_%s_%s_%d_%s", type, STATE_CODE, CITY_CODE, year, paddedSequence);
    }
    
    /**
     * Extract numeric ID from code
     * @param code The formatted code like FIR_MH_PNE_2025_000123
     * @return The numeric sequence number
     */
    public Integer extractSequence(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }
        String[] parts = code.split("_");
        if (parts.length == 5) {
            try {
                return Integer.parseInt(parts[4]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    /**
     * Generate next Complaint ID by querying database for count
     * @return Formatted complaint ID like CMP_MH_PNE_2025_000001
     */
    public String generateNextComplaintId() {
        long count = complaintRepository.count() + 1;
        return generateCode("CMP", (int) count);
    }
    
    /**
     * Generate next FIR ID by querying database for count
     * @return Formatted FIR ID like FIR_MH_PNE_2025_000001
     */
    public String generateNextFirId() {
        long count = firRepository.count() + 1;
        return generateCode("FIR", (int) count);
    }
}
