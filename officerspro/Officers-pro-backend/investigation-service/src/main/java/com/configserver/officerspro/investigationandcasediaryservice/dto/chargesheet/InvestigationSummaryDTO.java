package com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Investigation summary for ChargeSheet service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationSummaryDTO {
    private String investigationId; // String format: INV/MH/PNE/2025/000789
    private String firId; // String format: FIR/MH/PNE/2025/000123
    private String caseId; // String format: CASE/MH/PNE/2025/000123
    
    private InvestigatingOfficerDTO investigatingOfficer;
    private String investigationStatus;
    
    private List<CaseDiaryEntryDTO> caseDiary;
    private List<EvidenceDTO> evidences;
}
