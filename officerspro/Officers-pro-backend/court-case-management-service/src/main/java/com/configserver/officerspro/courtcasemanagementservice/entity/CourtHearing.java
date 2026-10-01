package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.HearingStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "court_hearing")
public class CourtHearing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hearingId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private CourtCase courtCase;

    @Column(name = "case_id", insertable = false, updatable = false)
    private Long caseId;

    private LocalDateTime scheduledAt;
    private String venue;
    private String remarks;

    @Enumerated(EnumType.STRING)
    private HearingStatus status;

    @OneToMany(mappedBy = "courtHearing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HearingParticipant> participants;

    // Default constructor
    public CourtHearing() {}

    // Getters and Setters
    public Long getHearingId() {
        return hearingId;
    }

    public void setHearingId(Long hearingId) {
        this.hearingId = hearingId;
    }

    public CourtCase getCourtCase() {
        return courtCase;
    }

    public void setCourtCase(CourtCase courtCase) {
        this.courtCase = courtCase;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public HearingStatus getStatus() {
        return status;
    }

    public void setStatus(HearingStatus status) {
        this.status = status;
    }

    public List<HearingParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<HearingParticipant> participants) {
        this.participants = participants;
    }
}
