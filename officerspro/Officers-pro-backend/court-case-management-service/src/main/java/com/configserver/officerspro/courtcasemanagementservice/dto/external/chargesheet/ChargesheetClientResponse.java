package com.configserver.officerspro.courtcasemanagementservice.dto.external.chargesheet;

import java.time.LocalDateTime;
import java.util.List;

public class ChargesheetClientResponse {

    private String chargesheetId;
    private String ferristId;
    private String caseId;
    private String firId;
    private String investigationId;
    private Integer versionNumber;
    private Boolean isSubmitted;
    private String courtName;
    private LocalDateTime hearingDate;
    private String remarks;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private Integer submittedBy;
    private LocalDateTime submittedAt;

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

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
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

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(Integer submittedBy) {
        this.submittedBy = submittedBy;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
