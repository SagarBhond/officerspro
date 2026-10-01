package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.JudgmentOutcome;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "judgment")
public class Judgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long judgmentId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private CourtCase courtCase;

    @Column(name = "case_id", insertable = false, updatable = false)
    private Long caseId;

    @ManyToOne
    @JoinColumn(name = "hearing_id", nullable = false)
    private CourtHearing courtHearing;

    @Column(name = "hearing_id", insertable = false, updatable = false)
    private Long hearingId;

    private String summary;
    private LocalDate judgmentDate;
    private Long recordedBy;
    private LocalDateTime recordedOn;

    @Enumerated(EnumType.STRING)
    private JudgmentOutcome outcome;

    // Default constructor
    public Judgment() {}

    // Getters and Setters
    public Long getJudgmentId() {
        return judgmentId;
    }

    public void setJudgmentId(Long judgmentId) {
        this.judgmentId = judgmentId;
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

    public CourtHearing getCourtHearing() {
        return courtHearing;
    }

    public void setCourtHearing(CourtHearing courtHearing) {
        this.courtHearing = courtHearing;
    }

    public Long getHearingId() {
        return hearingId;
    }

    public void setHearingId(Long hearingId) {
        this.hearingId = hearingId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDate getJudgmentDate() {
        return judgmentDate;
    }

    public void setJudgmentDate(LocalDate judgmentDate) {
        this.judgmentDate = judgmentDate;
    }

    public Long getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(Long recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getRecordedOn() {
        return recordedOn;
    }

    public void setRecordedOn(LocalDateTime recordedOn) {
        this.recordedOn = recordedOn;
    }

    public JudgmentOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(JudgmentOutcome outcome) {
        this.outcome = outcome;
    }
}
