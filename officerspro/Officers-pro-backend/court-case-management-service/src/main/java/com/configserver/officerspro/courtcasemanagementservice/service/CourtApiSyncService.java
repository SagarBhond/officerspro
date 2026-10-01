package com.configserver.officerspro.courtcasemanagementservice.service;

import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCase;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtHearing;
import com.configserver.officerspro.courtcasemanagementservice.entity.Judgment;
import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;
import com.configserver.officerspro.courtcasemanagementservice.enums.JudgmentOutcome;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtCaseRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.CourtHearingRepository;
import com.configserver.officerspro.courtcasemanagementservice.repository.JudgmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CourtApiSyncService {

    private static final Logger log = LoggerFactory.getLogger(CourtApiSyncService.class);
    
    private final MockCourtDataService mockCourtDataService;
    private final CourtCaseRepository courtCaseRepository;
    private final CourtHearingRepository courtHearingRepository;
    private final JudgmentRepository judgmentRepository;

    public CourtApiSyncService(MockCourtDataService mockCourtDataService,
                               CourtCaseRepository courtCaseRepository,
                               CourtHearingRepository courtHearingRepository,
                               JudgmentRepository judgmentRepository) {
        this.mockCourtDataService = mockCourtDataService;
        this.courtCaseRepository = courtCaseRepository;
        this.courtHearingRepository = courtHearingRepository;
        this.judgmentRepository = judgmentRepository;
    }

    /**
     * Sync court tracking ID from mock court API
     * In production, this would call the real government court API
     */
    @Transactional
    public CourtCase syncCourtTracking(Long caseId) {
        CourtCase courtCase = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Court case not found: " + caseId));
        
        String firId = courtCase.getFirId();
        log.info("Syncing court tracking for case {} with FIR {}", caseId, firId);
        
        // Call mock court API to get tracking details
        Map<String, Object> tracking = mockCourtDataService.getTrackingByFirId(firId);
        
        if (tracking == null) {
            log.warn("No court tracking found for FIR: {}", firId);
            throw new RuntimeException("Court tracking not found for FIR: " + firId);
        }
        
        // Update court case with tracking ID and court name
        String courtTrackingId = (String) tracking.get("courtTrackingId");
        String courtName = (String) tracking.get("courtName");
        
        courtCase.setCourtTrackingId(courtTrackingId);
        courtCase.setCourtName(courtName);
        
        CourtCase saved = courtCaseRepository.save(courtCase);
        log.info("Court tracking synced successfully: {}", courtTrackingId);
        
        return saved;
    }

    /**
     * Sync hearings from mock court API
     * In production, this would call the real government court API
     */
    @Transactional
    public List<CourtHearing> syncHearings(Long caseId) {
        CourtCase courtCase = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Court case not found: " + caseId));
        
        String courtTrackingId = courtCase.getCourtTrackingId();
        
        if (courtTrackingId == null || courtTrackingId.isEmpty()) {
            throw new RuntimeException("Court tracking ID not set. Please sync court tracking first.");
        }
        
        log.info("Syncing hearings for case {} with tracking ID {}", caseId, courtTrackingId);
        
        // Call mock court API to get hearings
        List<Map<String, Object>> hearingData = mockCourtDataService.getHearingsByTrackingId(courtTrackingId);
        
        if (hearingData.isEmpty()) {
            log.info("No hearings found for tracking ID: {}", courtTrackingId);
            return new ArrayList<>();
        }
        
        List<CourtHearing> savedHearings = new ArrayList<>();
        
        for (Map<String, Object> data : hearingData) {
            String hearingDate = (String) data.get("hearingDate");
            String hearingTime = (String) data.get("hearingTime");
            
            // Parse date and time
            LocalDateTime scheduledAt = parseDateTime(hearingDate, hearingTime);
            
            // Check if hearing already exists at this exact date/time for this case
            Optional<CourtHearing> existingHearing = courtHearingRepository.findByCaseIdAndScheduledAt(
                courtCase.getCaseId(), scheduledAt);
            
            if (existingHearing.isPresent()) {
                log.info("Hearing at {} already exists, skipping duplicate", scheduledAt);
                savedHearings.add(existingHearing.get());
                continue;
            }
            
            // Create new hearing only if doesn't exist
            CourtHearing hearing = new CourtHearing();
            hearing.setCourtCase(courtCase);
            hearing.setScheduledAt(scheduledAt);
            
            String venue = (String) data.get("venue");
            hearing.setVenue(venue);
            
            String statusStr = (String) data.get("status");
            HearingStatus status = HearingStatus.valueOf(statusStr);
            hearing.setStatus(status);
            
            CourtHearing saved = courtHearingRepository.save(hearing);
            savedHearings.add(saved);
            
            log.info("Hearing synced: {} at {}", saved.getHearingId(), scheduledAt);
        }
        
        log.info("Successfully synced {} hearings", savedHearings.size());
        return savedHearings;
    }

    /**
     * Parse date and time strings into LocalDateTime
     */
    private LocalDateTime parseDateTime(String date, String time) {
        try {
            String dateTimeStr = date + " " + time;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            return LocalDateTime.parse(dateTimeStr, formatter);
        } catch (Exception e) {
            log.error("Failed to parse date/time: {} {}", date, time, e);
            return LocalDateTime.now();
        }
    }
    
    /**
     * Sync judgments from mock court API
     * In production, this would call the real government court API
     */
    @Transactional
    public List<Judgment> syncJudgments(Long caseId) {
        CourtCase courtCase = courtCaseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Court case not found: " + caseId));
        
        String courtTrackingId = courtCase.getCourtTrackingId();
        
        if (courtTrackingId == null || courtTrackingId.isEmpty()) {
            throw new RuntimeException("Court tracking ID not set. Please sync court tracking first.");
        }
        
        log.info("Syncing judgments for case {} with tracking ID {}", caseId, courtTrackingId);
        
        // Call mock court API to get judgments
        List<Map<String, Object>> judgmentData = mockCourtDataService.getJudgmentsByTrackingId(courtTrackingId);
        
        if (judgmentData.isEmpty()) {
            log.info("No judgments found for tracking ID: {}", courtTrackingId);
            return new ArrayList<>();
        }
        
        List<Judgment> savedJudgments = new ArrayList<>();
        
        // First, get all hearings for this case to match with judgments
        List<CourtHearing> caseHearings = courtHearingRepository.findByCaseId(courtCase.getCaseId());
        
        for (Map<String, Object> data : judgmentData) {
            // Get hearing date from judgment data
            String hearingDateStr = (String) data.get("hearingDate");
            
            // Find matching hearing by date
            CourtHearing matchingHearing = caseHearings.stream()
                .filter(h -> {
                    LocalDate hearingDate = h.getScheduledAt().toLocalDate();
                    return hearingDate.toString().equals(hearingDateStr);
                })
                .findFirst()
                .orElse(null);
            
            if (matchingHearing == null) {
                log.warn("No hearing found for date {}, skipping judgment", hearingDateStr);
                continue;
            }
            
            // Check if judgment already exists for this hearing
            List<Judgment> existingJudgments = judgmentRepository.findByCaseIdAndHearingId(
                courtCase.getCaseId(), matchingHearing.getHearingId());
            
            if (!existingJudgments.isEmpty()) {
                log.info("Judgment already exists for hearing {}, skipping duplicate", matchingHearing.getHearingId());
                savedJudgments.add(existingJudgments.get(0));
                continue;
            }
            
            // Create new judgment only if doesn't exist
            Judgment judgment = new Judgment();
            judgment.setCourtCase(courtCase);
            judgment.setCourtHearing(matchingHearing);
            
            String summary = (String) data.get("summary");
            judgment.setSummary(summary);
            
            String outcomeStr = (String) data.get("outcome");
            JudgmentOutcome outcome = JudgmentOutcome.valueOf(outcomeStr);
            judgment.setOutcome(outcome);
            
            String judgmentDateStr = (String) data.get("judgmentDate");
            LocalDate judgmentDate = LocalDate.parse(judgmentDateStr);
            judgment.setJudgmentDate(judgmentDate);
            
            judgment.setRecordedOn(LocalDateTime.now());
            judgment.setRecordedBy(1L);
            
            Judgment saved = judgmentRepository.save(judgment);
            savedJudgments.add(saved);
            
            log.info("Judgment synced: {} for hearing {}", saved.getJudgmentId(), matchingHearing.getHearingId());
        }
        
        log.info("Successfully synced {} judgments", savedJudgments.size());
        return savedJudgments;
    }
}
