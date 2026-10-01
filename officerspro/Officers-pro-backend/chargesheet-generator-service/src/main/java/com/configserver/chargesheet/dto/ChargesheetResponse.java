package com.configserver.chargesheet.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ChargesheetResponse {
    private String chargesheetId;
    private String ferristId;
    private Integer versionNumber;
    private String courtName;
    private Boolean isSubmitted;
    private String remarks;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private DocumentInfo mergedDocument;
    private List<IndexEntry> indexEntries;

    @Data
    @Builder
    public static class DocumentInfo {
        private Long documentId;
        private String fileName;
        private String mimeType;
        private Integer pageCount;
        private String s3Link;
        private Long sizeBytes;
    }

    @Data
    @Builder
    public static class IndexEntry {
        private Integer sequenceNo;
        private String documentName;
        private Integer startPage;
        private Integer endPage;
    }
}
