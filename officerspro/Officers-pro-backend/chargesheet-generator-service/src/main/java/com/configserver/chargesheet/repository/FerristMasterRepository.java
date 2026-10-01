package com.configserver.chargesheet.repository;

import com.configserver.chargesheet.entity.FerristMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface FerristMasterRepository extends JpaRepository<FerristMaster, String> {
    Optional<FerristMaster> findFirstByCaseIdOrderByVersionNumberDesc(String caseId);
    Optional<FerristMaster> findByFerristId(String ferristId);
    List<FerristMaster> findByCaseIdOrderByVersionNumberAsc(String caseId);
    boolean existsByFerristIdAndIsFinalizedTrue(String ferristId);
}
