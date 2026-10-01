package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.response.ChargesheetSummaryResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.FirChargesheetResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.ChargesheetLookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/integration/chargesheets")
public class ChargesheetIntegrationController {

    private final ChargesheetLookupService chargesheetLookupService;

    public ChargesheetIntegrationController(ChargesheetLookupService chargesheetLookupService) {
        this.chargesheetLookupService = chargesheetLookupService;
    }

    @GetMapping
    public ResponseEntity<List<FirChargesheetResponse>> listFirChargesheets(
            @RequestParam(value = "firId", required = false) String firId) {
        return ResponseEntity.ok(chargesheetLookupService.getFirChargesheets(firId));
    }

    @GetMapping("/{chargesheetId}")
    public ResponseEntity<ChargesheetSummaryResponse> getChargesheet(@PathVariable String chargesheetId) {
        ChargesheetSummaryResponse response = chargesheetLookupService.getChargesheet(chargesheetId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}

