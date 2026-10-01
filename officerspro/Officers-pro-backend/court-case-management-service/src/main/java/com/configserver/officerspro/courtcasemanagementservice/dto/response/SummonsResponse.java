package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SummonsResponse {
    private Long summonsId;
    private Long caseId;
    private Long hearingId;
    private Long recipientId;
    private String recipientType;
    private String recipientName;
    private LocalDate appearanceDate;
    private LocalDateTime issuedAt;
    private String status;

    // Default constructor
    public SummonsResponse() {}

    // Getters and Setters
    public Long getSummonsId() {
        return summonsId;
    }

    public void setSummonsId(Long summonsId) {
        this.summonsId = summonsId;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public Long getHearingId() {
        return hearingId;
    }

    public void setHearingId(Long hearingId) {
        this.hearingId = hearingId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public LocalDate getAppearanceDate() {
        return appearanceDate;
    }

    public void setAppearanceDate(LocalDate appearanceDate) {
        this.appearanceDate = appearanceDate;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }
}
