package com.configserver.chargesheet.dto;

import lombok.Data;

@Data
public class AddDocumentRequest {
    private Long documentId;
    private Long insertAfterDocumentId; // optional
    private Integer position;           // optional
    private Integer addedBy;
    private String description;         // NEW: description from Available Docs
    private String remarks;
}
