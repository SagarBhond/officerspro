package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourtHearingRepository extends JpaRepository<CourtHearing, Long> {
    List<CourtHearing> findByCaseId(Long caseId);
    List<CourtHearing> findByCaseIdAndStatus(Long caseId, HearingStatus status);
    
    // Find hearing by ID and case ID to validate ownership
    @Query("SELECT h FROM CourtHearing h WHERE h.hearingId = :hearingId AND h.caseId = :caseId")
    Optional<CourtHearing> findByHearingIdAndCaseId(@Param("hearingId") Long hearingId, @Param("caseId") Long caseId);
    
    // Find hearing by case ID and scheduled time to prevent duplicates
    Optional<CourtHearing> findByCaseIdAndScheduledAt(Long caseId, java.time.LocalDateTime scheduledAt);
}
