package com.configserver.officerspro.courtcasemanagementservice.service;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.DocumentMappingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.request.ChargesheetSyncRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.MappingResponse;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.DocumentItemResponse;

import java.util.List;

public interface DocumentService {
    MappingResponse addDocumentMapping(Long caseId, DocumentMappingRequest req);
    List<DocumentItemResponse> listDocuments(Long caseId);
    void deleteMapping(Long caseId, Long mappingId);
    List<DocumentItemResponse> syncChargesheetDocuments(Long caseId, String chargesheetId, ChargesheetSyncRequest req);
}
