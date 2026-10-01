package com.configserverllp.officerspro.documentmanagementservice.repository;

import com.configserverllp.officerspro.documentmanagementservice.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for performing CRUD and custom queries on DocumentEntity.
 */
@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    /**
     * Find all documents linked to a specific entity (FIR, EVIDENCE, etc.)
     * @param linkedTo entity type (e.g., "EVIDENCE", "FIR", etc.)
     * @param linkId ID of the linked entity (e.g., "officer_xyz", "fir_01")
     * @return list of matching documents
     */
    List<DocumentEntity> findByLinkedToIgnoreCaseAndLinkId(String linkedTo, String linkId);

    /**
     * Find all documents uploaded by a specific officer/user.
     * @param uploadedBy user ID
     * @return list of uploaded documents
     */
    List<DocumentEntity> findByUploadedBy(Long uploadedBy);

    /**
     * Find all documents created between two timestamps (for audits/reports).
     * @param start starting date-time
     * @param end ending date-time
     * @return list of documents created in that range
     */
    List<DocumentEntity> findByCreatedOnBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    /**
     * Optional convenience finder for status dashboards — get documents by type only.
     * @param linkedTo type name
     * @return list of documents of that type
     */
    List<DocumentEntity> findByLinkedToIgnoreCase(String linkedTo);
}
