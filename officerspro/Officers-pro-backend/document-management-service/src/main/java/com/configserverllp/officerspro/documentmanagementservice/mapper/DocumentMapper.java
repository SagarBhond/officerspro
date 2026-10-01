package com.configserverllp.officerspro.documentmanagementservice.mapper;

import com.configserverllp.officerspro.documentmanagementservice.dto.DocumentDto;
import com.configserverllp.officerspro.documentmanagementservice.entity.DocumentEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between DocumentEntity and DocumentDto
 */
@Component
public class DocumentMapper {

    public DocumentDto toDto(DocumentEntity entity) {
        if (entity == null) {
            return null;
        }

        return DocumentDto.builder()
                .documentId(entity.getDocumentId())
                .fileName(entity.getFileName())
                .filePath(entity.getFilePath())  // NEW: filePath mapping
                .uploadedBy(entity.getUploadedBy())
                .uploadedOn(entity.getUploadedOn())
                .linkedTo(entity.getLinkedTo())
                .linkId(entity.getLinkId())
                .createdBy(entity.getCreatedBy())
                .createdOn(entity.getCreatedOn())
                .updatedBy(entity.getUpdatedBy())
                .updatedOn(entity.getUpdatedOn())
                .build();
    }

    public DocumentEntity toEntity(DocumentDto dto) {
        if (dto == null) {
            return null;
        }

        return DocumentEntity.builder()
                .documentId(dto.getDocumentId())
                .fileName(dto.getFileName())
                .filePath(dto.getFilePath())  // NEW: filePath mapping
                .uploadedBy(dto.getUploadedBy())
                .uploadedOn(dto.getUploadedOn())
                .linkedTo(dto.getLinkedTo())
                .linkId(dto.getLinkId())
                .createdBy(dto.getCreatedBy())
                .createdOn(dto.getCreatedOn())
                .updatedBy(dto.getUpdatedBy())
                .updatedOn(dto.getUpdatedOn())
                .build();
    }

    public List<DocumentDto> toDtoList(List<DocumentEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<DocumentEntity> toEntityList(List<DocumentDto> dtos) {
        if (dtos == null) {
            return null;
        }

        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public void updateEntityFromDto(DocumentDto dto, DocumentEntity entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getFileName() != null) {
            entity.setFileName(dto.getFileName());
        }
        if (dto.getFilePath() != null) {  // NEW: filePath update
            entity.setFilePath(dto.getFilePath());
        }
        if (dto.getUploadedBy() != null) {
            entity.setUploadedBy(dto.getUploadedBy());
        }
        if (dto.getUploadedOn() != null) {
            entity.setUploadedOn(dto.getUploadedOn());
        }
        if (dto.getLinkedTo() != null) {
            entity.setLinkedTo(dto.getLinkedTo());
        }
        if (dto.getLinkId() != null) {
            entity.setLinkId(dto.getLinkId());
        }
        if (dto.getUpdatedBy() != null) {
            entity.setUpdatedBy(dto.getUpdatedBy());
        }
        if (dto.getUpdatedOn() != null) {
            entity.setUpdatedOn(dto.getUpdatedOn());
        }
    }
}