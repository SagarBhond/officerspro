package com.adminbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {

    private String officerId;
    private long rating;
    private String feedbackDesc;
    private String officerName;
    private String officerPost;
    private String officerStation;

    private LocalDateTime createdOn;

}
