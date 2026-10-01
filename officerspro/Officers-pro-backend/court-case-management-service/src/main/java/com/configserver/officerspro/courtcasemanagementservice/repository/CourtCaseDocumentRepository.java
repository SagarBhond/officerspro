package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCaseDocument;
import com.configserver.officerspro.courtcasemanagementservice.enums.DocumentSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourtCaseDocumentRepository extends JpaRepository<CourtCaseDocument, Long> {
    List<CourtCaseDocument> findByCaseId(Long caseId);
    List<CourtCaseDocument> findByCaseIdAndSource(Long caseId, DocumentSource source);
    List<CourtCaseDocument> findByCaseIdAndSourceAndSourceId(Long caseId, DocumentSource source, String sourceId);
}
