package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.Judgment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JudgmentRepository extends JpaRepository<Judgment, Long> {
    
    // Find by case ID (for backward compatibility)
    List<Judgment> findByCaseId(Long caseId);
    
    // Find by hearing ID
    List<Judgment> findByHearingId(Long hearingId);
    
    // Find by case ID and hearing ID
    List<Judgment> findByCaseIdAndHearingId(Long caseId, Long hearingId);
    
    // Find latest judgment for a case (for backward compatibility)
    @Query("SELECT j FROM Judgment j WHERE j.caseId = :caseId ORDER BY j.recordedOn DESC")
    List<Judgment> findByCaseIdOrderByRecordedOnDesc(@Param("caseId") Long caseId);
    
    // Find judgment by ID and validate it belongs to case and hearing
    @Query("SELECT j FROM Judgment j WHERE j.judgmentId = :judgmentId AND j.caseId = :caseId AND j.hearingId = :hearingId")
    Optional<Judgment> findByJudgmentIdAndCaseIdAndHearingId(@Param("judgmentId") Long judgmentId, 
                                                             @Param("caseId") Long caseId, 
                                                             @Param("hearingId") Long hearingId);
    
    // Find first judgment for a hearing (to check if one exists)
    @Query("SELECT j FROM Judgment j WHERE j.caseId = :caseId AND j.hearingId = :hearingId ORDER BY j.recordedOn DESC")
    Optional<Judgment> findFirstByCaseIdAndHearingId(@Param("caseId") Long caseId, @Param("hearingId") Long hearingId);
}
