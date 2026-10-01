package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Integer> {

    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.documentType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Document> searchDocuments(@Param("keyword") String keyword, Pageable pageable);

    List<Document> findByDocumentType(String documentType);
    List<Document> findByUploadedBy(Integer uploadedBy);

    @Query("SELECT d FROM Document d WHERE " +
           "(:documentType IS NULL OR d.documentType = :documentType) AND " +
           "(:uploadedBy IS NULL OR d.uploadedBy = :uploadedBy)")
    Page<Document> findAllWithFilters(
        @Param("documentType") String documentType,
        @Param("uploadedBy") Integer uploadedBy,
        Pageable pageable
    );
}
