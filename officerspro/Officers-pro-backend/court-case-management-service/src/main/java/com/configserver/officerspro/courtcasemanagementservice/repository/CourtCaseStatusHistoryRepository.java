package com.configserver.officerspro.courtcasemanagementservice.repository;

import com.configserver.officerspro.courtcasemanagementservice.entity.CourtCaseStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourtCaseStatusHistoryRepository extends JpaRepository<CourtCaseStatusHistory, Long> {
}
