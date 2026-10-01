package com.configserver.officerspro.auditservice.repository;

import com.configserver.officerspro.auditservice.entity.AuditTrail;
import com.configserver.officerspro.auditservice.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {

    List<AuditTrail> findByTableName(String tableName);

    List<AuditTrail> findByTableNameAndRecordId(String tableName, Long recordId);

    List<AuditTrail> findByChangedBy(Long changedBy);

    List<AuditTrail> findByAction(ActionType action);

    List<AuditTrail> findByChangedOnBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<AuditTrail> findByTableNameAndAction(String tableName, ActionType action);
}
