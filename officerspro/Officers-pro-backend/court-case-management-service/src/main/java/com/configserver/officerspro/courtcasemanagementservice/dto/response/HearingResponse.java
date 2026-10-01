package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.time.LocalDateTime;

public class HearingResponse {
    private Long hearingId;
    private Long caseId;
    private LocalDateTime scheduledAt;
    private String status;

    // Default constructor
    public HearingResponse() {}

    // Getters and Setters
    public Long getHearingId() {
        return hearingId;
    }

    public void setHearingId(Long hearingId) {
        this.hearingId = hearingId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
