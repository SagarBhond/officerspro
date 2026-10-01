package com.configserver.officerspro.helpsupportfeedbackservice.dto;

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
public class CommentRequestDTO {

    @NotNull(message = "Ticket ID is required")
    private Integer ticketId;

    @NotNull(message = "Commented by is required")
    private Integer commentedBy;

    @NotBlank(message = "Message is required")
    private String message;

    private Integer attachmentDocumentId;

    @NotNull(message = "Created by is required")
    private Integer createdBy;
}
