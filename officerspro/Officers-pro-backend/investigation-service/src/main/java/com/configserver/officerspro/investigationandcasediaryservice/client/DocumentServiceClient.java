package com.configserver.officerspro.investigationandcasediaryservice.client;

import com.configserver.officerspro.investigationandcasediaryservice.config.FeignConfig;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

/**
 * Feign client for communicating with the Document Management Service.
 *
 * Uses a custom Feign configuration (FeignConfig) to ensure multipart/form-data
 * requests (file uploads) are encoded correctly via SpringFormEncoder.
 */
@FeignClient(
    name = "document-service",
    url = "${document.service.url:http://localhost:8085}",
    configuration = FeignConfig.class
)
public interface DocumentServiceClient {

    /**
     * Upload a file to the Document Management Service.
     *
     * Expected form fields:
     * - file: the multipart file
     * - linkedTo: entity name (e.g. "FIR", "EVIDENCE", "CITIZEN")
     * - linkId: identifier of the linked entity (string)
     * - tag: optional document tag/type
     * - uploadedBy: optional uploader id (string)
     *
     * @param file the file to upload
     * @param linkedTo the entity type this document is linked to
     * @param linkId the id of the linked entity (as string)
     * @param tag optional tag or document type
     * @param uploadedBy optional uploader id
     * @return a Map with response data (e.g. documentId, fileName)
     */
    @PostMapping(
        value = "/api/documents/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    Map<String, Object> uploadDocument(
        @RequestPart("file") MultipartFile file,
        @RequestPart("linkedTo") String linkedTo,
        @RequestPart(value = "linkId", required = false) String linkId,
        @RequestPart(value = "tag", required = false) String tag,
        @RequestPart(value = "uploadedBy", required = false) String uploadedBy
    );

    @GetMapping("/api/documents/{id}")
    Map<String, Object> getDocumentMetadata(@PathVariable("id") Long id);
}
