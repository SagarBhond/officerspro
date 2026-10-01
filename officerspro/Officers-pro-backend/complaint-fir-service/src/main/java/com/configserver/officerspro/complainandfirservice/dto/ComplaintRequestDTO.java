package com.configserver.officerspro.complainandfirservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ComplaintRequestDTO {
    private String subject;
    private String description;
    private String crimeAddress;
    private LocalDateTime crimeDateTime;
    private Integer filedByStationId;
    private ComplaintStatus status;
    private Integer createdBy;
    private LocalDateTime createdOn;
    private Integer updatedBy;
    private LocalDateTime updatedOn;
    private List<ComplaintParticipantDTO> participants;
    private Map<Integer, MultipartFile> documents;
    private List<ComplaintParticipantDTO> offenderParticipants;
    private Map<Integer, MultipartFile> offenderDocuments;
    private List<ComplaintParticipantDTO> witnessParticipants;
    private Map<Integer, MultipartFile> witnessDocuments;
}
