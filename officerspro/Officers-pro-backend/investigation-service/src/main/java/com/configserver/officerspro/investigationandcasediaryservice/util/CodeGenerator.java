package com.configserver.officerspro.investigationandcasediaryservice.util;

import org.springframework.stereotype.Component;

import java.time.Year;

/**
 * Generates string-based unique codes for entities required by ChargeSheet service
 * Format: {TYPE}/{STATE}/{CITY}/{YEAR}/{SEQUENCE}
 * Example: FIR/MH/PNE/2025/000123
 */
@Component
public class CodeGenerator {

    // Configuration - can be made configurable via properties
    private static final String STATE_CODE = "MH"; // Maharashtra
    private static final String CITY_CODE = "PNE"; // Pune
    
    /**
     * Generate FIR code
     * @param sequence The numeric ID of the FIR
     * @return Formatted FIR code like FIR/MH/PNE/2025/000123
     */
    public String generateFirCode(Integer sequence) {
        return generateCode("FIR", sequence);
    }
    
    /**
     * Generate Complaint code
     * @param sequence The numeric ID of the complaint
     * @return Formatted complaint code like CMP/MH/PNE/2025/000123
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
        return generateCodeWithUnderscore("INV", sequence);
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
     * Generate Case code from FIR ID string
     * @param firId The FIR ID string (e.g., FIR_MH_PNE_2025_000001)
     * @return Formatted case code like CASE_MH_PNE_2025_000001
     */
    public String generateCaseCodeFromFirId(String firId) {
        if (firId == null || firId.isEmpty()) {
            return null;
        }
        // Extract the sequence from FIR ID and use it for case code
        String[] parts = firId.split("_");
        if (parts.length == 5) {
            try {
                int sequence = Integer.parseInt(parts[4]);
                return generateCode("CASE", sequence);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    /**
     * Generate Evidence code
     * @param sequence The numeric ID
     * @return Formatted evidence code like EVD/MH/PNE/2025/0100
     */
    public String generateEvidenceCode(Integer sequence) {
        return generateCode("EVD", sequence);
    }
    
    /**
     * Generate Case Diary code
     * @param sequence The numeric ID
     * @return Formatted case diary code like CD/MH/PNE/2025/001
     */
    public String generateCaseDiaryCode(Integer sequence) {
        return generateCode("CD", sequence);
    }
    
    /**
     * Generic code generation method with slashes
     * @param type The type prefix (FIR, CMP, INV, etc.)
     * @param sequence The numeric sequence
     * @return Formatted code like FIR/MH/PNE/2025/000123
     */
    private String generateCode(String type, Integer sequence) {
        int year = Year.now().getValue();
        String paddedSequence = String.format("%06d", sequence); // 6-digit zero-padded
        return String.format("%s/%s/%s/%d/%s", type, STATE_CODE, CITY_CODE, year, paddedSequence);
    }
    
    /**
     * Generic code generation method with underscores
     * @param type The type prefix (FIR, INV, etc.)
     * @param sequence The numeric sequence
     * @return Formatted code like FIR_MH_PNE_2025_000123
     */
    private String generateCodeWithUnderscore(String type, Integer sequence) {
        int year = Year.now().getValue();
        String paddedSequence = String.format("%06d", sequence); // 6-digit zero-padded
        return String.format("%s_%s_%s_%d_%s", type, STATE_CODE, CITY_CODE, year, paddedSequence);
    }
    
    /**
     * Extract numeric ID from code
     * @param code The formatted code like FIR/MH/PNE/2025/000123 or FIR_MH_PNE_2025_000123
     * @return The numeric sequence number
     */
    public Integer extractSequence(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }
        // Try splitting by slash first (for slash-based codes)
        String[] parts = code.split("/");
        if (parts.length == 5) {
            try {
                return Integer.parseInt(parts[4]);
            } catch (NumberFormatException e) {
                // Continue to try underscore format
            }
        }
        
        // Try splitting by underscore (for underscore-based codes)
        parts = code.split("_");
        if (parts.length == 5) {
            try {
                return Integer.parseInt(parts[4]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
