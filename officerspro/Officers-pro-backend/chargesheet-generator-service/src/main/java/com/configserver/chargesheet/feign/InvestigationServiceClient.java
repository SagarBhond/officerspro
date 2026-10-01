package com.configserver.chargesheet.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "investigation-service", url = "http://localhost:4001") // JSON Server
public interface InvestigationServiceClient {

    @GetMapping("/investigation/ferrist-ready/{investigationId}")
    Map<String, Object> getFerristReadyDocuments(@PathVariable("investigationId") String investigationId);
}
