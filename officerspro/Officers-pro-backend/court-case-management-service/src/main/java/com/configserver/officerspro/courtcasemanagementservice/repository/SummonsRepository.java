package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.Summons;
import com.configserver.officerspro.courtcasemanagementservice.enums.SummonsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SummonsRepository extends JpaRepository<Summons, Long> {
    
    // Find by case ID (for backward compatibility)
    List<Summons> findByCaseId(Long caseId);
    
    // Find by hearing ID
    List<Summons> findByHearingId(Long hearingId);
    
    // Find by case ID and hearing ID
    List<Summons> findByCaseIdAndHearingId(Long caseId, Long hearingId);
    
    // Find by hearing ID and status
    List<Summons> findByHearingIdAndStatus(Long hearingId, SummonsStatus status);
    
    // Find summons by ID and validate it belongs to case and hearing
    @Query("SELECT s FROM Summons s WHERE s.summonsId = :summonsId AND s.caseId = :caseId AND s.hearingId = :hearingId")
    Optional<Summons> findBySummonsIdAndCaseIdAndHearingId(@Param("summonsId") Long summonsId, 
                                                           @Param("caseId") Long caseId, 
                                                           @Param("hearingId") Long hearingId);
}
