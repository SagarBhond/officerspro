package com.configserver.chargesheet.dto;

import lombok.Data;

@Data
public class FerristAddDocumentRequest {
    private Long documentId;
    private Long insertAfterDocumentId;   // optional
    private Integer position;             // optional
    private Integer addedBy;
    private String remarks;
}
