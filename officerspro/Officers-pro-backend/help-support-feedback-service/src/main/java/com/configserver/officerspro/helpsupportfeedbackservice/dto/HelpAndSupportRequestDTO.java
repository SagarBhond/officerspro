package com.configserver.officerspro.helpsupportfeedbackservice.dto;

import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpAndSupportRequestDTO {

    @NotNull(message = "Raised by user ID is required")
    private Integer raisedByUserId;

    private String officerUuid; // Optional: Actual officer UUID for fetching officer details

    private Integer assignedTo;
    
    private Integer assignedBy;

    private TicketStatus status;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Created by is required")
    private Integer createdBy;

    private Long attachmentDocumentId; // Optional: Document ID from document service
}
