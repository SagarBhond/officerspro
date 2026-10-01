package com.configserver.officerspro.investigationandcasediaryservice.controller;

import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import com.configserver.officerspro.investigationandcasediaryservice.dto.chargesheet.InvestigationSummaryDTO;
import com.configserver.officerspro.investigationandcasediaryservice.entity.Investigation;
import com.configserver.officerspro.investigationandcasediaryservice.enums.InvestigationStatus;
import com.configserver.officerspro.investigationandcasediaryservice.service.EvidenceDocumentQueryService;
import com.configserver.officerspro.investigationandcasediaryservice.service.InvestigationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/investigation")
@Tag(name = "Investigation Management", description = "APIs for managing investigations")
//@CrossOrigin(origins = "*")
public class InvestigationController {

    @Autowired
    private InvestigationService investigationService;

    @Autowired
    private EvidenceDocumentQueryService evidenceQueryService;

    // Investigation CRUD endpoints
    @PostMapping("/new")
    @Operation(summary = "Create investigation", description = "Creates a new investigation record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Investigation created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<InvestigationDTO> createInvestigation(@RequestBody InvestigationRequestDTO requestDTO) {
        InvestigationDTO investigation = investigationService.createInvestigation(requestDTO);
        return new ResponseEntity<>(investigation, HttpStatus.CREATED);
    }

    // Frontend-specific endpoints
    @PostMapping("/updateInvestigation")
    @Operation(summary = "Update investigation (Frontend Integration)", description = "Updates investigation with offender arrest status and case status")
    public ResponseEntity<String> updateInvestigationFrontend(@RequestBody InvestigationUpdateDTO updateDTO) {
        return investigationService.updateInvestigationFrontend(updateDTO)
                .map(errorMessage -> ResponseEntity.badRequest().body(errorMessage))
                .orElse(ResponseEntity.ok("Investigation updated successfully"));
    }

    @PutMapping("/updateInvestigationById")
    @Operation(summary = "Update investigation by ID", description = "Updates investigation description and details by investigation ID")
    public ResponseEntity<String> updateInvestigationById(@RequestBody InvestigationByIdUpdateDTO updateDTO) {
        try {
            investigationService.updateInvestigationById(updateDTO);
            return ResponseEntity.ok("Investigation updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update investigation: " + e.getMessage());
        }
    }

    @GetMapping("/getCaseDiary/{firId}")
    @Operation(summary = "Get case diary for FIR (Frontend Integration)", description = "Retrieves case diary and investigation details for a FIR")
    public ResponseEntity<CaseDiaryResponseDTO> getCaseDiaryForVictim(@Parameter(description = "FIR ID") @PathVariable String firId) {
        try {
            System.out.println("🔍 Controller received request for FIR ID: " + firId);
            return investigationService.getCaseDiaryForVictim(firId)
                    .map(caseDiary -> {
                        System.out.println("✅ Controller returning case diary data");
                        return ResponseEntity.ok(caseDiary);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Exception in controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ChargeSheet Integration endpoint
    @GetMapping("/investigation/chargesheet/{firId}")
    @Operation(summary = "Get investigation summary for ChargeSheet", 
               description = "Retrieves investigation summary including case diary and evidence for ChargeSheet integration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Investigation summary retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Investigation not found for the FIR")
    })
    public ResponseEntity<InvestigationSummaryDTO> getInvestigationForChargesheet(
            @Parameter(description = "FIR ID") @PathVariable String firId) {
        try {
            System.out.println("🔍 ChargeSheet Controller: Received request for FIR ID: " + firId);
            return investigationService.getInvestigationForChargesheet(firId)
                    .map(summary -> {
                        System.out.println("✅ ChargeSheet Controller: Returning investigation summary");
                        return ResponseEntity.ok(summary);
                    })
                    .orElseGet(() -> {
                        System.out.println("❌ ChargeSheet Controller: Investigation not found");
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            System.err.println("❌ ChargeSheet Controller Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Simple test endpoint to verify backend is responding
    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Simple test to verify backend is responding")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("🔍 Test endpoint called");
        return ResponseEntity.ok("Investigation service is running!");
    }


    @GetMapping("/investigation/active/{firId}")
    public ResponseEntity<ActiveInvestigationResponseDTO> getActiveInvestigation(
            @PathVariable String firId) {

        Optional<Investigation> invOpt = investigationService.findLatestActiveInvestigation(firId);

        // NO INVESTIGATION FOUND
        if (invOpt.isEmpty()) {
            return ResponseEntity.ok(
                    ActiveInvestigationResponseDTO.builder()
                            .exists(false)
                            .firId(firId)
                            .build()
            );
        }

        Investigation inv = invOpt.get();

        return ResponseEntity.ok(
                ActiveInvestigationResponseDTO.builder()
                        .exists(true)
                        .internalId(inv.getInternalId())
                        .investigationId(inv.getInvestigationId())
                        .firId(inv.getFirId())
                        .officerId(inv.getOfficerId())
                        .status(inv.getStatus().name())
                        .createdOn(inv.getCreatedOn())
                        .updatedOn(inv.getUpdatedOn())
                        .caseCode(null)   // optional
                        .build()
        );
    }


    @GetMapping("/investigation/available")
    public List<AvailableEvidenceDocumentDTO> getAvailableEvidence(
            @RequestParam String investigationId,
            @RequestParam(required = false) String ferristId
    ) {
        return evidenceQueryService.getAvailableEvidenceDocuments(investigationId, ferristId);
    }

}
