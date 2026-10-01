package com.configserver.officerspro.courtcasemanagementservice.client;

import com.configserver.officerspro.courtcasemanagementservice.dto.external.document.DocumentInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "documentCatalogClient", url = "${external.document.base-url}")
public interface DocumentServiceClient {

    @GetMapping("/{documentId}")
    DocumentInfoResponse getDocumentById(@PathVariable("documentId") Long documentId);

    @GetMapping
    List<DocumentInfoResponse> getDocumentsByLink(@RequestParam("linked_to") String linkedTo,
                                                  @RequestParam("link_id") String linkId);
}
