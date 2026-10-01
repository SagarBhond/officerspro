package com.configserver.officerspro.courtcasemanagementservice.dto.request;

import java.time.LocalDate;

public class JudgmentRequest {
    private String summary;
    private String outcome;
    private LocalDate judgmentDate;

    // Default constructor
    public JudgmentRequest() {}

    // Getters and Setters
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
