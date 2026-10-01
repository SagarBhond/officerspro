package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.SummonsStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "summons")
public class Summons {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long summonsId;

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

    private Long recipientId;
    private String recipientType;
    private LocalDateTime issuedAt;
    private LocalDate appearanceDate;

    @Enumerated(EnumType.STRING)
    private SummonsStatus status;

    // Default constructor
    public Summons() {}

    // Getters and Setters
    public Long getSummonsId() {
        return summonsId;
    }

    public void setSummonsId(Long summonsId) {
        this.summonsId = summonsId;
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

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public LocalDate getAppearanceDate() {
        return appearanceDate;
    }

    public void setAppearanceDate(LocalDate appearanceDate) {
        this.appearanceDate = appearanceDate;
    }

    public SummonsStatus getStatus() {
        return status;
    }

    public void setStatus(SummonsStatus status) {
        this.status = status;
    }
}
