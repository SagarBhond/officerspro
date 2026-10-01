package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.time.LocalDate;

public class JudgmentResponse {
    private Long judgmentId;
    private Long caseId;
    private Long hearingId;
    private String summary;
    private String outcome;
    private LocalDate judgmentDate;

    // Default constructor
    public JudgmentResponse() {}

    // Getters and Setters
    public Long getJudgmentId() {
        return judgmentId;
    }

    public void setJudgmentId(Long judgmentId) {
        this.judgmentId = judgmentId;
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

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public LocalDate getJudgmentDate() {
        return judgmentDate;
    }

    public void setJudgmentDate(LocalDate judgmentDate) {
        this.judgmentDate = judgmentDate;
    }
}
