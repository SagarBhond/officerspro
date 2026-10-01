package com.configserver.chargesheet.repository;

import com.configserver.chargesheet.entity.ChargesheetMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChargesheetMasterRepository extends JpaRepository<ChargesheetMaster, String> {
}
