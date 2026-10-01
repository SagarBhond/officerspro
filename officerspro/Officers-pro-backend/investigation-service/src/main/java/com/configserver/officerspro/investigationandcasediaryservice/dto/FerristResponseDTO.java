package com.configserver.officerspro.investigationandcasediaryservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class FerristResponseDTO {
    private FerristMasterDTO ferrist;
    private List<FerristDocumentDTO> documents;
}
