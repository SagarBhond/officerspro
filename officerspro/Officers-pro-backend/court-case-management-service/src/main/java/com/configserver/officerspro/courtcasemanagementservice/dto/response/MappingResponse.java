package com.configserver.officerspro.courtcasemanagementservice.dto.response;

public class MappingResponse {
    private Long mappingId;
    private Long caseId;
    private Long documentId;

    // Default constructor
    public MappingResponse() {}

    // Getters and Setters
    public Long getMappingId() {
        return mappingId;
    }

    public void setMappingId(Long mappingId) {
        this.mappingId = mappingId;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }
}
