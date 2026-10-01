package com.configserver.chargesheet.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "fir-service", url = "http://localhost:4002") // JSON Server
public interface FirServiceClient {

    @GetMapping("/complaint-fir/{firId}")
    Map<String, Object> getFirDetails(@PathVariable("firId") String firId);
}
