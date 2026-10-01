package com.configserver.officerspro.auditservice.service;

import com.configserver.officerspro.auditservice.dto.AuditTrailDTO;
import com.configserver.officerspro.auditservice.dto.AuditTrailRequestDTO;
import com.configserver.officerspro.auditservice.entity.AuditTrail;
import com.configserver.officerspro.auditservice.enums.ActionType;
import com.configserver.officerspro.auditservice.mapper.AuditTrailMapper;
import com.configserver.officerspro.auditservice.repository.AuditTrailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuditTrailService {

    private final AuditTrailRepository auditTrailRepository;
    private final AuditTrailMapper auditTrailMapper;

    public AuditTrailDTO createAuditTrail(AuditTrailRequestDTO requestDTO) {
        log.info("Creating audit trail for table: {}, recordId: {}, action: {}",
                requestDTO.getTableName(), requestDTO.getRecordId(), requestDTO.getAction());

        AuditTrail auditTrail = auditTrailMapper.toEntity(requestDTO);
        AuditTrail savedAudit = auditTrailRepository.save(auditTrail);

        log.info("Audit trail created with ID: {}", savedAudit.getAuditId());
        return auditTrailMapper.toDTO(savedAudit);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAllAuditTrails() {
        log.info("Fetching all audit trails");
        List<AuditTrail> auditTrails = auditTrailRepository.findAll();
        return auditTrailMapper.toDTOList(auditTrails);
    }

    @Transactional(readOnly = true)
    public AuditTrailDTO getAuditTrailById(Long auditId) {
        log.info("Fetching audit trail with ID: {}", auditId);
        AuditTrail auditTrail = auditTrailRepository.findById(auditId)
                .orElseThrow(() -> new RuntimeException("Audit trail not found with ID: " + auditId));
        return auditTrailMapper.toDTO(auditTrail);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAuditTrailsByTableName(String tableName) {
        log.info("Fetching audit trails for table: {}", tableName);
        List<AuditTrail> auditTrails = auditTrailRepository.findByTableName(tableName);
        return auditTrailMapper.toDTOList(auditTrails);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAuditTrailsByTableAndRecordId(String tableName, Long recordId) {
        log.info("Fetching audit trails for table: {}, recordId: {}", tableName, recordId);
        List<AuditTrail> auditTrails = auditTrailRepository.findByTableNameAndRecordId(tableName, recordId);
        return auditTrailMapper.toDTOList(auditTrails);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAuditTrailsByUserId(Long userId) {
        log.info("Fetching audit trails for user: {}", userId);
        List<AuditTrail> auditTrails = auditTrailRepository.findByChangedBy(userId);
        return auditTrailMapper.toDTOList(auditTrails);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAuditTrailsByAction(ActionType action) {
        log.info("Fetching audit trails for action: {}", action);
        List<AuditTrail> auditTrails = auditTrailRepository.findByAction(action);
        return auditTrailMapper.toDTOList(auditTrails);
    }

    @Transactional(readOnly = true)
    public List<AuditTrailDTO> getAuditTrailsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching audit trails between {} and {}", startDate, endDate);
        List<AuditTrail> auditTrails = auditTrailRepository.findByChangedOnBetween(startDate, endDate);
        return auditTrailMapper.toDTOList(auditTrails);
    }
}
