package com.configserver.officerspro.investigationandcasediaryservice.controller;

import com.configserver.officerspro.investigationandcasediaryservice.dto.WitnessDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.WitnessRequestDTO;
import com.configserver.officerspro.investigationandcasediaryservice.service.EvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/witnesses")
@Tag(name = "Witness Management", description = "APIs for managing witnesses")
//@CrossOrigin(origins = "*")
public class WitnessController {

    @Autowired
    private EvidenceService evidenceService;

    @PostMapping
    @Operation(summary = "Create a single witness", description = "Creates a single witness record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Witness created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<WitnessDTO> createWitness(@RequestBody WitnessRequestDTO requestDTO) {
        try {
            WitnessDTO witness = evidenceService.createWitness(requestDTO);
            return new ResponseEntity<>(witness, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/victim/{victimId}")
    @Operation(summary = "Create witnesses for a victim", description = "Creates multiple witness records for a specific victim")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Witnesses created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<List<WitnessDTO>> createWitnessesForVictim(
            @Parameter(description = "Victim ID") @PathVariable Integer victimId,
            @RequestPart("witnessDtosJson") String witnessDtosJson,
            @RequestPart("files") List<MultipartFile> files) {
        try {
            List<WitnessDTO> witnesses = evidenceService.createWitnessesForVictim(victimId, witnessDtosJson, files);
            return new ResponseEntity<>(witnesses, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get witness by ID", description = "Retrieves a specific witness by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Witness found"),
            @ApiResponse(responseCode = "404", description = "Witness not found")
    })
    public ResponseEntity<WitnessDTO> getWitnessById(@Parameter(description = "Witness ID") @PathVariable Integer id) {
        return evidenceService.getWitnessById(id)
                .map(witness -> ResponseEntity.ok(witness))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/investigation/{investigationId}")
    @Operation(summary = "Get witnesses by investigation ID", description = "Retrieves all witnesses for a specific investigation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Witnesses retrieved successfully")
    })
    public ResponseEntity<List<WitnessDTO>> getWitnessesByInvestigationId(@Parameter(description = "Investigation ID") @PathVariable Integer investigationId) {
        List<WitnessDTO> witnesses = evidenceService.getWitnessesByInvestigationId(investigationId);
        return ResponseEntity.ok(witnesses);
    }

    @GetMapping("/search")
    @Operation(summary = "Search witnesses", description = "Searches witnesses by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<WitnessDTO>> searchWitnesses(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<WitnessDTO> witnesses = evidenceService.searchWitnesses(keyword, pageable);
        return ResponseEntity.ok(witnesses);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update witness", description = "Updates an existing witness")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Witness updated successfully"),
            @ApiResponse(responseCode = "404", description = "Witness not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<WitnessDTO> updateWitness(
            @Parameter(description = "Witness ID") @PathVariable Integer id,
            @RequestBody WitnessRequestDTO requestDTO) {
        return evidenceService.updateWitness(id, requestDTO)
                .map(witness -> ResponseEntity.ok(witness))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete witness", description = "Deletes a witness by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Witness deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Witness not found")
    })
    public ResponseEntity<Void> deleteWitness(@Parameter(description = "Witness ID") @PathVariable Integer id) {
        return evidenceService.deleteWitness(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
