package com.configserver.chargesheet.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "document-service", url = "http://localhost:4000")   // JSON Server
public interface DocumentServiceClient {

    @GetMapping("/documents/{documentId}")
    Map<String, Object> getDocumentById(@PathVariable("documentId") Long documentId);
}
