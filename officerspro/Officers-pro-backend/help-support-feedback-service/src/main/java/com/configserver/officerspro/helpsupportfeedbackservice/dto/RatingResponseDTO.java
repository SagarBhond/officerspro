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
public class RatingResponseDTO {

    private Integer ratingId;
    private Integer ticketId;
    private Integer ratedBy;
    private String ratedByName; // Fetched from User Service
    private Integer score;
    private String feedback;
    private LocalDateTime createdOn;
}
