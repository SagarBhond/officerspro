package com.configserver.chargesheet.feign;

import com.configserver.chargesheet.dto.ChargesheetSubmissionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "court-case-service", url = "${external.courtcase.base-url}")
public interface CourtCaseServiceClient {
    
    /**
     * Notify court case service when a chargesheet is submitted
     * This triggers automatic court case creation or update
     */
    @PostMapping("/notification/chargesheet-submitted")
    void notifyChargesheetSubmission(@RequestBody ChargesheetSubmissionDto dto);
}
