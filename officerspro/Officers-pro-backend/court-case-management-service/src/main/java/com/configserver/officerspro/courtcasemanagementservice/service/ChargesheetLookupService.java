package com.configserver.officerspro.courtcasemanagementservice.service;

import com.configserver.officerspro.courtcasemanagementservice.dto.response.ChargesheetSummaryResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.FirChargesheetResponse;

import java.util.List;

public interface ChargesheetLookupService {

    List<FirChargesheetResponse> getFirChargesheets(String firId);

    ChargesheetSummaryResponse getChargesheet(String chargesheetId);
}

