package com.configserverllp.officerspro.documentmanagementservice.service;

import com.configserverllp.officerspro.documentmanagementservice.dto.DocumentDto;
import java.time.LocalDateTime;
import java.util.List;

public interface DocumentService {

    DocumentDto create(DocumentDto dto);

    DocumentDto getById(Long id);

    List<DocumentDto> getAll();

    List<DocumentDto> getByLinkedToAndLinkId(String linkedTo, String linkId);

    List<DocumentDto> getByUploadedBy(Long uploadedBy);

    DocumentDto update(Long id, DocumentDto dto);

    void delete(Long id);

    List<DocumentDto> getByCreatedOnRange(LocalDateTime start, LocalDateTime end);
    
    void updateLinkId(Long documentId, String linkId);
}
