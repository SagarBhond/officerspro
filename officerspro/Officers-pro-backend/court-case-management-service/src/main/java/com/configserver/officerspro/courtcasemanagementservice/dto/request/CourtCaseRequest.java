package com.configserver.officerspro.courtcasemanagementservice.dto.request;

public class CourtCaseRequest {
    private String caseNumber;
    private String chargesheetId;
    private String firId;
    private String courtName;
    private String courtTrackingId; // Court-provided tracking ID

    // Default constructor
    public CourtCaseRequest() {}

    // Getters and Setters
    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
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

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getCourtTrackingId() {
        return courtTrackingId;
    }

    public void setCourtTrackingId(String courtTrackingId) {
        this.courtTrackingId = courtTrackingId;
    }
}
