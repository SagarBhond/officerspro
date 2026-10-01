package com.adminbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpAndSupportDto {

    private String officerId;
    private String uuid ;
    private String subject;
    private String issueDesc;
    private String response;
    private LocalDateTime createdOn;
    private FileEntityDto issueImage;
    private String officerName;
}