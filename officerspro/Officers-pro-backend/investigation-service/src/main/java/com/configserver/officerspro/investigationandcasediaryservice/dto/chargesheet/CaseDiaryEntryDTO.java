package com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Case Diary Entry details for ChargeSheet service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDiaryEntryDTO {
    private Integer entryId;
    private LocalDateTime entryDate;
    private String entryType;
    private String description;
    private String location;
    private Integer officerId;
    private String officerName;
}
