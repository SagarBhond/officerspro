package com.configserver.officerspro.complainandfirservice.dto;

import com.configserver.officerspro.complainandfirservice.entity.ComplaintParticipant;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDTO {
    private String complaintId; // Changed to String to match WrittenComplaint entity
    private Integer filedByStationId;
    private LocalDateTime filedDate;
    private String subject;
    private String description;

    // Crime details
    private String crimeAddress;
    private LocalDateTime crimeDateTime;

    private ComplaintStatus status;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;

    // Full participant details for editing
    private List<ComplaintParticipant> participants;

    // Basic participant information for display (backward compatibility)
    private List<String> victimNames;    // Complainant names
    private List<String> offenderNames;  // Offender names

    // FIR information
    private String firNo;
    private LocalDateTime firRegisteredDate;
    private Boolean hasFIR;
}
