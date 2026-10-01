package com.configserver.officerspro.helpsupportfeedbackservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDTO {

    private Integer commentId;
    private Integer ticketId;
    private Integer commentedBy;
    private String commentedByName; // Fetched from User Service
    private String message;
    private Integer attachmentDocumentId;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
}
