package com.configserver.chargesheet.repository;

import com.configserver.chargesheet.entity.FerristDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FerristDocumentRepository extends JpaRepository<FerristDocument, Long> {

    // latest row per (ferrist_id, document_id) and active = true
    @Query("SELECT fd FROM FerristDocument fd WHERE fd.ferristId = :ferristId AND fd.isActive = true AND fd.createdAt = " +
            "(SELECT MAX(fd2.createdAt) FROM FerristDocument fd2 WHERE fd2.ferristId = fd.ferristId AND fd2.documentId = fd.documentId)")
    List<FerristDocument> findActiveLatestByFerristIdOrderBySequenceNumber(String ferristId);

    @Query("SELECT fd.documentId FROM FerristDocument fd WHERE fd.ferristId = :ferristId AND fd.isActive = true AND fd.createdAt = " +
            "(SELECT MAX(fd2.createdAt) FROM FerristDocument fd2 WHERE fd2.ferristId = fd.ferristId AND fd2.documentId = fd.documentId)")
    List<Long> findActiveDocumentIdsByFerristId(String ferristId);

    Optional<FerristDocument> findTopByFerristIdAndDocumentIdOrderByCreatedAtDesc(String ferristId, Long documentId);

    List<FerristDocument> findByFerristIdOrderByCreatedAtDesc(String ferristId);
}
