package com.configserver.officerspro.investigationandcasediaryservice.client;

import com.configserver.officerspro.investigationandcasediaryservice.config.FeignAuthInterceptor;
import com.configserver.officerspro.investigationandcasediaryservice.dto.FerristResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(
        name = "ferrist-service",
        url = "${services.ferrist.url}",
        configuration = FeignAuthInterceptor.class
)
public interface FerristClient {

    @GetMapping("/{ferristId}")
    FerristResponseDTO getFerrist(@PathVariable("ferristId") String ferristId);
}
