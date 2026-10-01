package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.time.LocalDateTime;

public class ChargesheetSummaryResponse {

    private String chargesheetId;
    private String ferristId;
    private String firId;
    private String investigationId;
    private Integer versionNumber;
    private Boolean isSubmitted;
    private String courtName;
    private LocalDateTime hearingDate;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private Long documentId;  // Single merged document ID

    public String getChargesheetId() {
        return chargesheetId;
    }

    public void setChargesheetId(String chargesheetId) {
        this.chargesheetId = chargesheetId;
    }

    public String getFerristId() {
        return ferristId;
    }

    public void setFerristId(String ferristId) {
        this.ferristId = ferristId;
    }

    public String getFirId() {
        return firId;
    }

    public void setFirId(String firId) {
        this.firId = firId;
    }

    public String getInvestigationId() {
        return investigationId;
    }

    public void setInvestigationId(String investigationId) {
        this.investigationId = investigationId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public Boolean getIsSubmitted() {
        return isSubmitted;
    }

    public void setIsSubmitted(Boolean isSubmitted) {
        this.isSubmitted = isSubmitted;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public LocalDateTime getHearingDate() {
        return hearingDate;
    }

    public void setHearingDate(LocalDateTime hearingDate) {
        this.hearingDate = hearingDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }
}
