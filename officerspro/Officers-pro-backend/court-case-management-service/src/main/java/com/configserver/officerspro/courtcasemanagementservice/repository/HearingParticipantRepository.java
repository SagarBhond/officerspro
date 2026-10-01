package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.HearingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HearingParticipantRepository extends JpaRepository<HearingParticipant, Long> {
    
    // Find participants by hearing ID
    List<HearingParticipant> findByCourtHearing_HearingId(Long hearingId);
    
    // Find participant by ID and hearing ID to validate ownership
    @Query("SELECT p FROM HearingParticipant p WHERE p.id = :participantId AND p.courtHearing.hearingId = :hearingId")
    Optional<HearingParticipant> findByIdAndHearingId(@Param("participantId") Long participantId, @Param("hearingId") Long hearingId);
}
