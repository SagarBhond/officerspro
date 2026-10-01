package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.Evidence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, Integer> {

    @Query("SELECT e FROM Evidence e WHERE " +
           "LOWER(e.evidenceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Evidence> searchEvidence(@Param("keyword") String keyword, Pageable pageable);

    List<Evidence> findByInvestigationId(String investigationId);
    long countByInvestigationId(String investigationId);
    
    // Find evidence by investigation internal ID (unique per investigation entry)
    List<Evidence> findByInvestigationInternalId(Integer investigationInternalId);
    long countByInvestigationInternalId(Integer investigationInternalId);

    @Query("SELECT e FROM Evidence e WHERE " +
           "(:investigationId IS NULL OR e.investigationId = :investigationId) AND " +
           "(:evidenceType IS NULL OR e.evidenceType = :evidenceType)")
    Page<Evidence> findAllWithFilters(
        @Param("investigationId") String investigationId,
        @Param("evidenceType") String evidenceType,
        Pageable pageable
    );


}
