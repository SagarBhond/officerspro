package com.configserver.chargesheet.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationSummaryDTO {
    private String investigationId;
    private String firId;
    private String complaintId;
    private OfficerDTO investigatingOfficer;
    private String investigationStatus;
    private List<CaseDiaryDTO> caseDiary;
    private List<EvidenceDTO> evidences;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class OfficerDTO {
    private Integer officerId;
    private String name;
    private String designation;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CaseDiaryDTO {
    private String entryId;
    private String entryDate;
    private String summary;
    private Integer createdBy;
    private String createdAt;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class EvidenceDTO {
    private String evidenceId;
    private String type;
    private String description;
    private String status;
    private List<DocumentResponseDTO> documents;
    private List<MultimediaResponseDTO> multimediaFiles;
}
