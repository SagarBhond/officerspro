package com.configserver.officerspro.investigationandcasediaryservice.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FerristDocumentDTO {

    private Long ferristDocumentId;
    private String ferristId;
    private Long documentId;
    private Integer sequenceNumber;
    private ActionType actionType;
    private Boolean isActive;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private String remarks;

    public enum ActionType {
        ADDED, DELETED, RESTORED, REORDERED
    }
}
