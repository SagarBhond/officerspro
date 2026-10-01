package com.configserver.chargesheet.dto;

public class ChargesheetSubmissionDto {
    
    private String chargesheetId;
    private String firId;
    private String ferristId;
    
    public ChargesheetSubmissionDto() {
    }
    
    public ChargesheetSubmissionDto(String chargesheetId, String firId, String ferristId) {
        this.chargesheetId = chargesheetId;
        this.firId = firId;
        this.ferristId = ferristId;
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
    
    public String getFerristId() {
        return ferristId;
    }
    
    public void setFerristId(String ferristId) {
        this.ferristId = ferristId;
    }
}
