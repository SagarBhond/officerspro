package com.cms.officerspro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
