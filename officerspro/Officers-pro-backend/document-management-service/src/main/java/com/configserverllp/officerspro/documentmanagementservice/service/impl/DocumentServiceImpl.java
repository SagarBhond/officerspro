package com.configserverllp.officerspro.documentmanagementservice.service.impl;

import com.configserverllp.officerspro.documentmanagementservice.dto.DocumentDto;
import com.configserverllp.officerspro.documentmanagementservice.entity.DocumentEntity;
import com.configserverllp.officerspro.documentmanagementservice.exception.DocumentNotFoundException;
import com.configserverllp.officerspro.documentmanagementservice.mapper.DocumentMapper;
import com.configserverllp.officerspro.documentmanagementservice.repository.DocumentRepository;
import com.configserverllp.officerspro.documentmanagementservice.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of DocumentService
 * Handles business logic, exception handling, and entity <-> DTO conversion.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;

    /**
     * Create and save a new document record.
     */
    @Override
    @Transactional
    public DocumentDto create(DocumentDto dto) {
        DocumentEntity entity = documentMapper.toEntity(dto);
        System.out.println(dto.getLinkId());

        // Set created timestamp if missing
        if (entity.getCreatedOn() == null) {
            entity.setCreatedOn(LocalDateTime.now());
        }
        if (entity.getUploadedOn() == null) {
            entity.setUploadedOn(LocalDateTime.now());
        }

        DocumentEntity saved = documentRepository.save(entity);
        return documentMapper.toDto(saved);
    }

    /**
     * Fetch a document by ID.
     * Throws DocumentNotFoundException if not found.
     */
    @Override
    public DocumentDto getById(Long id) {
        DocumentEntity entity = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with ID: " + id));
        return documentMapper.toDto(entity);
    }

    /**
     * Fetch all documents.
     */
    @Override
    public List<DocumentDto> getAll() {
        List<DocumentEntity> entities = documentRepository.findAll();
        return documentMapper.toDtoList(entities);
    }

    /**
     * Fetch documents linked to a specific entity (e.g., FIR, EVIDENCE, etc.)
     */
    @Override
    public List<DocumentDto> getByLinkedToAndLinkId(String linkedTo, String linkId) {
        List<DocumentEntity> entities = documentRepository.findByLinkedToIgnoreCaseAndLinkId(linkedTo, linkId);
        return documentMapper.toDtoList(entities);
    }

    /**
     * Fetch all documents uploaded by a specific officer/user.
     */
    @Override
    public List<DocumentDto> getByUploadedBy(Long uploadedBy) {
        List<DocumentEntity> entities = documentRepository.findByUploadedBy(uploadedBy);
        return documentMapper.toDtoList(entities);
    }

    /**
     * Update a document (partial or full).
     */
    @Override
    @Transactional
    public DocumentDto update(Long id, DocumentDto dto) {
        DocumentEntity existing = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Cannot update. Document not found with ID: " + id));

        documentMapper.updateEntityFromDto(dto, existing);
        existing.setUpdatedOn(LocalDateTime.now());

        DocumentEntity updated = documentRepository.save(existing);
        return documentMapper.toDto(updated);
    }

    /**
     * Delete a document by ID.
     */
    @Override
    @Transactional
    public void delete(Long id) {
        DocumentEntity existing = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Cannot delete. Document not found with ID: " + id));
        documentRepository.delete(existing);
    }

    /**
     * Fetch all documents created between two timestamps.
     */
    @Override
    public List<DocumentDto> getByCreatedOnRange(LocalDateTime start, LocalDateTime end) {
        List<DocumentEntity> entities = documentRepository.findByCreatedOnBetween(start, end);
        return documentMapper.toDtoList(entities);
    }
    
    /**
     * Update only the linkId field of a document.
     */
    @Override
    @Transactional
    public void updateLinkId(Long documentId, String linkId) {
        DocumentEntity existing = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Cannot update linkId. Document not found with ID: " + documentId));
        
        existing.setLinkId(linkId);
        existing.setUpdatedOn(LocalDateTime.now());
        documentRepository.save(existing);
        
        System.out.println("✅ Updated document " + documentId + " with linkId: " + linkId);
    }
}
