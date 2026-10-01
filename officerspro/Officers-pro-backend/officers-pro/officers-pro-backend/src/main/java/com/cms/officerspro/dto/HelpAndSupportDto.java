package com.cms.officerspro.dto;

import com.cms.officerspro.entity.FileEntity;
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
    private FileEntity issueImage;
    private String officerName;
}
