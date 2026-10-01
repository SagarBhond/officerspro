package com.configserver.officerspro.investigationandcasediaryservice.service;

import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import com.configserver.officerspro.investigationandcasediaryservice.entity.Investigation;
import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvestigationService {

    // Investigation CRUD methods
    InvestigationDTO createInvestigation(InvestigationRequestDTO requestDTO);

    // Frontend integration methods
    Optional<String> updateInvestigationFrontend(InvestigationUpdateDTO updateDTO);
    
    void updateInvestigationById(InvestigationByIdUpdateDTO updateDTO);

    Optional<CaseDiaryResponseDTO> getCaseDiaryForVictim(String firId);

    // ChargeSheet integration method
    Optional<com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.InvestigationSummaryDTO> getInvestigationForChargesheet(String firId);

    // Cross-service communication methods (updated to use Feign)
    Optional<FirResponseDTO> getFirDataFromComplaintService(Integer firId);

    Optional<ComplaintResponseDTO> getComplaintDataFromComplaintService(Long complaintId);

    // Evidence management
    EvidenceDTO createEvidence(EvidenceRequestDTO requestDTO);

    EvidenceDTO uploadEvidence(Integer investigationId, EvidenceRequestDTO evidenceRequest, MultipartFile file);

    Optional<EvidenceDTO> getEvidenceById(Integer evidenceId);

    List<EvidenceDTO> getEvidenceByInvestigationId(Integer investigationId);

    Optional<EvidenceDTO> updateEvidence(Integer evidenceId, EvidenceRequestDTO requestDTO);

    boolean deleteEvidence(Integer evidenceId);

    Optional<Investigation> findLatestActiveInvestigation(String firId);


}
