package com.configserver.officerspro.investigationandcasediaryservice.service;


import com.configserver.officerspro.investigationandcasediaryservice.dto.AvailableEvidenceDocumentDTO;

import java.util.List;

public interface EvidenceDocumentQueryService {

    List<AvailableEvidenceDocumentDTO> getAvailableEvidenceDocuments(
            String investigationId,
            String ferristId
    );
}
