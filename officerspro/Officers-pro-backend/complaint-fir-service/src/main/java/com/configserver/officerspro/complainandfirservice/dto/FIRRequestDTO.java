package com.configserver.officerspro.complainandfirservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class FIRRequestDTO {

    private Integer complaintId;
    private Integer officerId;
    private String description;
    private String sections;
    // Removed MultipartFile firFile - will be handled separately
}
