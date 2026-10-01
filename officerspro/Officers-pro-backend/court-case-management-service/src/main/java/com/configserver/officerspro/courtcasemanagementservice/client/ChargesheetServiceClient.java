package com.configserver.officerspro.courtcasemanagementservice.client;

import com.configserver.officerspro.courtcasemanagementservice.dto.external.chargesheet.ChargesheetClientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "chargesheetServiceClient", url = "${external.chargesheet.base-url}")
public interface ChargesheetServiceClient {

    @GetMapping("/chargesheet/all")
    List<ChargesheetClientResponse> getAllChargesheets(@RequestParam(value = "isSubmitted", required = false) Boolean isSubmitted);

    @GetMapping(value = "/chargesheet/all")
    List<ChargesheetClientResponse> getChargesheetsByFir(
            @RequestParam("firId") String firId,
            @RequestParam(value = "isSubmitted", required = false) Boolean isSubmitted
    );

    @GetMapping("/chargesheet/{chargesheetId}")
    ChargesheetClientResponse getChargesheetDetails(@PathVariable("chargesheetId") String chargesheetId);

    @GetMapping("/chargesheet/{chargesheetId}/document-id")
    Map<String, Object> getChargesheetDocumentId(@PathVariable("chargesheetId") String chargesheetId);
}
