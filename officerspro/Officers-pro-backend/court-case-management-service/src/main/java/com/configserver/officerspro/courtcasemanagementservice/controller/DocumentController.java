package com.configserver.officerspro.courtcasemanagementservice.controller;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.DocumentMappingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.ChargesheetSyncRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.DocumentItemResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.MappingResponse;
import com.configserver.officerspro.courtcasemanagementservice.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courtcases/{caseId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<MappingResponse> addDocumentMapping(@PathVariable Long caseId,
                                                              @RequestBody DocumentMappingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.addDocumentMapping(caseId, request));
    }

    @GetMapping
    public ResponseEntity<List<DocumentItemResponse>> listDocuments(@PathVariable Long caseId) {
        return ResponseEntity.ok(documentService.listDocuments(caseId));
    }

    @DeleteMapping("/{mappingId}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long caseId, @PathVariable Long mappingId) {
        documentService.deleteMapping(caseId, mappingId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/chargesheets/{chargesheetId}/sync-docs")
    public ResponseEntity<List<DocumentItemResponse>> syncChargesheetDocs(@PathVariable Long caseId,
                                                                          @PathVariable String chargesheetId,
                                                                          @RequestBody ChargesheetSyncRequest request) {
        return ResponseEntity.ok(documentService.syncChargesheetDocuments(caseId, chargesheetId, request));
    }
}
