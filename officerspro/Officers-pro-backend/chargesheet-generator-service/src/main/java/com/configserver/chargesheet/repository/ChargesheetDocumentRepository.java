package com.configserver.chargesheet.repository;

import com.configserver.chargesheet.entity.ChargesheetDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChargesheetDocumentRepository extends JpaRepository<ChargesheetDocument, Long> {

    Optional<ChargesheetDocument> findFirstByChargesheetIdAndDocumentType(
            String chargesheetId,
            ChargesheetDocument.DocumentType documentType
    );
}
