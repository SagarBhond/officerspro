package com.configserver.officerspro.investigationandcasediaryservice.service;

import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EvidenceService {

    EvidenceDTO createEvidence(EvidenceRequestDTO requestDTO);

    EvidenceDTO uploadEvidence(String investigationId, EvidenceRequestDTO requestDTO, MultipartFile file);

    Optional<EvidenceDTO> getEvidenceById(Integer evidenceId);

    List<EvidenceDTO> getEvidenceByInvestigationId(String investigationId);

    List<EvidenceDTO> getEvidenceByInternalId(Integer investigationInternalId);

    Page<EvidenceDTO> searchEvidence(String keyword, Pageable pageable);

    Page<EvidenceDTO> getAllEvidenceWithFilters(
            String investigationId,
            String evidenceType,
            Pageable pageable);

    Optional<EvidenceDTO> updateEvidence(Integer evidenceId, EvidenceRequestDTO requestDTO);

    boolean deleteEvidence(Integer evidenceId);

    long countByInvestigationId(String investigationId);

    // Evidence-Document management
    EvidenceDocumentDTO linkDocumentToEvidence(EvidenceDocumentRequestDTO requestDTO);

    List<EvidenceDocumentDTO> getDocumentsByEvidenceId(Integer evidenceId);

    boolean unlinkDocumentFromEvidence(Integer evidenceId, Integer documentId);

    // Document management
    DocumentDTO uploadDocument(DocumentRequestDTO requestDTO, MultipartFile file);

    Optional<DocumentDTO> getDocumentById(Integer documentId);

    List<DocumentDTO> getDocumentsByType(String documentType);

    Page<DocumentDTO> searchDocuments(String keyword, Pageable pageable);

    boolean deleteDocument(Integer documentId);

    // Panchnama management
    PanchnamaDTO createPanchnama(PanchnamaRequestDTO requestDTO);

    Optional<PanchnamaDTO> getPanchnamaById(Integer panchnamaId);

    List<PanchnamaDTO> getPanchnamasByEvidenceId(Integer evidenceId);

    Page<PanchnamaDTO> searchPanchnamas(String keyword, Pageable pageable);

    Optional<PanchnamaDTO> updatePanchnama(Integer panchnamaId, PanchnamaRequestDTO requestDTO);

    boolean deletePanchnama(Integer panchnamaId);

    // Forensic Report management
    ForensicReportDTO createForensicReport(ForensicReportRequestDTO requestDTO);

    Optional<ForensicReportDTO> getForensicReportById(Integer forensicReportId);

    List<ForensicReportDTO> getForensicReportsByEvidenceId(Integer evidenceId);

    List<ForensicReportDTO> getForensicReportsByLabName(String labName);

    Page<ForensicReportDTO> searchForensicReports(String keyword, Pageable pageable);

    Optional<ForensicReportDTO> updateForensicReport(Integer forensicReportId, ForensicReportRequestDTO requestDTO);

    boolean deleteForensicReport(Integer forensicReportId);

    // Witness management
    WitnessDTO createWitness(WitnessRequestDTO requestDTO);

    List<WitnessDTO> createWitnessesForVictim(Integer victimId, String witnessDtosJson, List<MultipartFile> files);

    Optional<WitnessDTO> getWitnessById(Integer witnessId);

    List<WitnessDTO> getWitnessesByInvestigationId(Integer investigationId);

    Page<WitnessDTO> searchWitnesses(String keyword, Pageable pageable);

    Optional<WitnessDTO> updateWitness(Integer witnessId, WitnessRequestDTO requestDTO);

    boolean deleteWitness(Integer witnessId);
}
