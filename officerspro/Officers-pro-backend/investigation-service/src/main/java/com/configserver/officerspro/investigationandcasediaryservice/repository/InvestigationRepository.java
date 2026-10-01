package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.Investigation;
import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvestigationRepository extends JpaRepository<Investigation, Integer> {
    
    @Query("SELECT i FROM Investigation i WHERE " +
           "LOWER(i.status) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Investigation> searchInvestigations(@Param("keyword") String keyword, Pageable pageable);

    List<Investigation> findByFirId(String firId);
    List<Investigation> findByOfficerId(Integer officerId);
    List<Investigation> findByStatus(InvestigationStatus status);
    long countByStatus(InvestigationStatus status);
    long countByAssignedOnAfter(LocalDateTime date);

    boolean existsByFirId(String firId);
    
    // Find by business investigationId (String format like INV/MH/PNE/2025/000001)
    // Returns the most recently updated investigation if multiple exist
    @Query("SELECT i FROM Investigation i WHERE i.investigationId = :investigationId ORDER BY i.updatedOn DESC, i.createdOn DESC")
    Optional<Investigation> findByInvestigationId(@Param("investigationId") String investigationId);

    @Query("SELECT i FROM Investigation i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:officerId IS NULL OR i.officerId = :officerId) AND " +
           "(:firId IS NULL OR i.firId = :firId) AND " +
           "(CAST(:startDate AS date) IS NULL OR i.assignedOn >= :startDate) AND " +
           "(CAST(:endDate AS date) IS NULL OR i.assignedOn <= :endDate)")
    Page<Investigation> findAllWithFilters(
        @Param("status") InvestigationStatus status,
        @Param("officerId") Integer officerId,
        @Param("firId") String firId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(investigation_id, -6) AS UNSIGNED)), 0) + 1 FROM investigation", nativeQuery = true)
    Integer getNextInvestigationSequence();

    @Query("SELECT i FROM Investigation i WHERE i.firId = :firId AND i.status = 'IN_PROGRESS' ORDER BY i.createdOn DESC")
    List<Investigation> findLatestActive(@Param("firId") String firId);



}
