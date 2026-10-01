package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.time.LocalDateTime;

public class CourtCaseResponse {
    private Long caseId;
    private String caseNumber;
    private String courtName;
    private String status;
    private LocalDateTime createdOn;
    private String chargesheetId;
    private String firId;
    private String courtTrackingId;
    private String currentChargesheetId;

    // Default constructor
    public CourtCaseResponse() {}

    // Getters and Setters
    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDateTime createdOn) {
        this.createdOn = createdOn;
    }

    public String getChargesheetId() {
        return chargesheetId;
    }

    public void setChargesheetId(String chargesheetId) {
        this.chargesheetId = chargesheetId;
    }

    public String getFirId() {
        return firId;
    }

    public void setFirId(String firId) {
        this.firId = firId;
    }

    public String getCourtTrackingId() {
        return courtTrackingId;
    }

    public void setCourtTrackingId(String courtTrackingId) {
        this.courtTrackingId = courtTrackingId;
    }

    public String getCurrentChargesheetId() {
        return currentChargesheetId;
    }

    public void setCurrentChargesheetId(String currentChargesheetId) {
        this.currentChargesheetId = currentChargesheetId;
    }
}
