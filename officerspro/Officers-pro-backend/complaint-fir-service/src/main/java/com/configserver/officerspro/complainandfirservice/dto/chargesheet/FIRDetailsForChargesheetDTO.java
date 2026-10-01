package com.configserver.officerspro.complainandfirservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Complete FIR details response for ChargeSheet service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FIRDetailsForChargesheetDTO {
    private String firId;  // String format: FIR/MH/PNE/2025/000123
    private String complaintId; // String format: CMP/MH/PNE/2025/01234
    private LocalDateTime firDate;
    private String policeStation;
    private String officerInCharge;
    private List<String> ipcSections;
    
    private ComplaintDetailsDTO complaintDetails;
    private ParticipantsDTO participants;
    private List<DocumentDTO> documents;
}
