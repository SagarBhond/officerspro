package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.EvidenceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EvidenceDocumentRepository extends JpaRepository<EvidenceDocument, Integer> {

    List<EvidenceDocument> findByEvidenceId(Integer evidenceId);
    List<EvidenceDocument> findByDocumentId(Integer documentId);

    @Query("SELECT ed FROM EvidenceDocument ed WHERE ed.evidenceId = :evidenceId AND ed.documentId = :documentId")
    List<EvidenceDocument> findByEvidenceIdAndDocumentId(@Param("evidenceId") Integer evidenceId, @Param("documentId") Integer documentId);

    List<EvidenceDocument> findByEvidenceIdIn(List<Integer> evidenceIds);



}
