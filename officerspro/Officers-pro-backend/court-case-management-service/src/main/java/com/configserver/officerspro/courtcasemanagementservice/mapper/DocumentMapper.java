package com.configserver.officerspro.courtcasemanagementservice.mapper;

import com.configserver.officerspro.courtcasemanagementservice.dto.request.DocumentMappingRequest;
import com.configserver.officerspro.courtcasemanagementservice.dto.response.MappingResponse;
import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCaseDocument;

public class DocumentMapper {
    
    public static CourtCaseDocument toEntity(Long caseId, DocumentMappingRequest request) {
        CourtCaseDocument doc = new CourtCaseDocument();
        doc.setCaseId(caseId);
        doc.setDocumentId(request.getDocumentId());
        doc.setDocumentType(request.getDocumentType());
        return doc;
    }
    
    public static MappingResponse toResponse(CourtCaseDocument entity) {
        MappingResponse response = new MappingResponse();
        response.setMappingId(entity.getId());
        response.setCaseId(entity.getCaseId());
        response.setDocumentId(entity.getDocumentId());
        return response;
    }
}
