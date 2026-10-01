package com.configserver.officerspro.courtcasemanagementservice.dto.external.document;

import java.time.LocalDateTime;

public class DocumentInfoResponse {

    private Long documentId;
    private String fileName;
    private String filePath;
    private Long uploadedBy;
    private LocalDateTime uploadedOn;
    private String linkedTo;
    private String linkId;

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedOn() {
        return uploadedOn;
    }

    public void setUploadedOn(LocalDateTime uploadedOn) {
        this.uploadedOn = uploadedOn;
    }

    public String getLinkedTo() {
        return linkedTo;
    }

    public void setLinkedTo(String linkedTo) {
        this.linkedTo = linkedTo;
    }

    public String getLinkId() {
        return linkId;
    }

    public void setLinkId(String linkId) {
        this.linkId = linkId;
    }
}

