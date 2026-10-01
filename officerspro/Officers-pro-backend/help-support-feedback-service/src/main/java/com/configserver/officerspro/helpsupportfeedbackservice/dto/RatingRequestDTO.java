package com.configserver.officerspro.helpsupportfeedbackservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingRequestDTO {

    @NotNull(message = "Ticket ID is required")
    private Integer ticketId;

    @NotNull(message = "Rated by is required")
    private Integer ratedBy;

    private String officerUuid; // Optional: Actual officer UUID for fetching officer details

    @NotNull(message = "Score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score must be at most 5")
    private Integer score;

    private String feedback;

    @NotNull(message = "Created by is required")
    private Integer createdBy;
}
