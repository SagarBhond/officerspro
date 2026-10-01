package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import java.util.List;

public class FirChargesheetResponse {

    private String firId;
    private List<ChargesheetSummaryResponse> chargesheets;

    public String getFirId() {
        return firId;
    }

    public void setFirId(String firId) {
        this.firId = firId;
    }

    public List<ChargesheetSummaryResponse> getChargesheets() {
        return chargesheets;
    }

    public void setChargesheets(List<ChargesheetSummaryResponse> chargesheets) {
        this.chargesheets = chargesheets;
    }
}
