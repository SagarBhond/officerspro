package com.configserverllp.officerspro.documentmanagementservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard API error response structure.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiErrorDto {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private List<String> details;
}
