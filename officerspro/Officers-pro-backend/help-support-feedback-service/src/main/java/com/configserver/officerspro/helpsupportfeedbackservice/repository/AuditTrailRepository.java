package com.configserver.officerspro.helpsupportfeedbackservice.repository;

import com.configserver.officerspro.helpsupportfeedbackservice.entity.SupportAuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditTrailRepository extends JpaRepository<SupportAuditTrail, Integer> {

    // Find all audit trails for a specific ticket
    List<SupportAuditTrail> findByTicketIdOrderByActionTimeDesc(Integer ticketId);

    // Find audit trails by action type
    List<SupportAuditTrail> findByActionTypeOrderByActionTimeDesc(String actionType);

    // Find audit trails by user
    List<SupportAuditTrail> findByActionByOrderByActionTimeDesc(Integer userId);
}
