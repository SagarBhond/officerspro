package com.configserver.officerspro.helpsupportfeedbackservice.dto;

import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpAndSupportResponseDTO {

    private Integer ticketId;
    private Integer raisedByUserId;
    private String raisedByUserName; // From CMS User Service
    private Integer assignedTo;
    private String assignedToName; // From Admin User Service
    private Integer assignedBy;
    private String assignedByName; // From Admin User Service
    private TicketStatus status;
    private String subject;
    private String description;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
    private List<CommentResponseDTO> comments;
    private List<RatingResponseDTO> ratings;
    private Integer totalComments;
    private Double averageRating;
    private Long attachmentDocumentId; // Document ID from document service
}
