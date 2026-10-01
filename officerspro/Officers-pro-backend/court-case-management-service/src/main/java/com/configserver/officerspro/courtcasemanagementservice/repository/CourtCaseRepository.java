package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.enums.CaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourtCaseRepository extends JpaRepository<CourtCase, Long> {
    
    // Find by case number (exact match)
    Optional<CourtCase> findByCaseNumber(String caseNumber);
    
    // Find by case number (contains search)
    @Query("SELECT c FROM CourtCase c WHERE c.caseNumber LIKE %:caseNumber%")
    List<CourtCase> findByCaseNumberContaining(@Param("caseNumber") String caseNumber);
    
    // Find by status
    Page<CourtCase> findByStatus(CaseStatus status, Pageable pageable);
    
    // Find by status and case number contains
    @Query("SELECT c FROM CourtCase c WHERE c.status = :status AND c.caseNumber LIKE %:caseNumber%")
    Page<CourtCase> findByStatusAndCaseNumberContaining(@Param("status") CaseStatus status, 
                                                       @Param("caseNumber") String caseNumber, 
                                                       Pageable pageable);
    
    // Find all with pagination and sorting
    Page<CourtCase> findAll(Pageable pageable);
    
    // Find by FIR ID
    Optional<CourtCase> findByFirId(String firId);
}
