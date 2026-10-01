package com.configserver.officerspro.courtcasemanagementservice.dto.request;

public class DocumentMappingRequest {
    private Long documentId;
    private String documentType;

    // Default constructor
    public DocumentMappingRequest() {}

    // Getters and Setters
    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }
}
