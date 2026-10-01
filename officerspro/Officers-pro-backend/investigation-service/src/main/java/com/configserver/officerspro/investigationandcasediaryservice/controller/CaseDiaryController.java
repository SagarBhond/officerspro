package com.configserver.officerspro.investigationandcasediaryservice.controller;

import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryRequestDTO;
import com.configserver.officerspro.investigationandcasediaryservice.service.CaseDiaryService;
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

@RestController
@RequestMapping("/api/casediary")
@Tag(name = "Case Diary Management", description = "APIs for managing case diary entries")
//@CrossOrigin(origins = "*")
public class CaseDiaryController {

    @Autowired
    private CaseDiaryService caseDiaryService;

    @PostMapping
    @Operation(summary = "Create a new case diary entry", description = "Creates a new case diary entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Case diary entry created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<CaseDiaryDTO> createCaseDiary(@RequestBody CaseDiaryRequestDTO requestDTO) {
        CaseDiaryDTO caseDiary = caseDiaryService.createCaseDiary(requestDTO);
        return new ResponseEntity<>(caseDiary, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case diary entry by ID", description = "Retrieves a specific case diary entry by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Case diary entry found"),
            @ApiResponse(responseCode = "404", description = "Case diary entry not found")
    })
    public ResponseEntity<CaseDiaryDTO> getCaseDiaryById(@Parameter(description = "Diary ID") @PathVariable Integer id) {
        CaseDiaryDTO caseDiary = caseDiaryService.getCaseDiaryById(id);
        return ResponseEntity.ok(caseDiary);
    }

    @GetMapping("/investigation/{investigationId}")
    @Operation(summary = "Get case diary entries by investigation ID", description = "Retrieves all case diary entries for a specific investigation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Case diary entries retrieved successfully")
    })
    public ResponseEntity<List<CaseDiaryDTO>> getCaseDiariesByInvestigationId(@Parameter(description = "Investigation ID") @PathVariable Integer investigationId) {
        List<CaseDiaryDTO> caseDiaries = caseDiaryService.getCaseDiariesByInvestigationId(String.valueOf(investigationId));
        return ResponseEntity.ok(caseDiaries);
    }

    @GetMapping
    @Operation(summary = "Get all case diary entries with optional filters", description = "Retrieves case diary entries with pagination and optional filtering")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Case diary entries retrieved successfully")
    })
    public ResponseEntity<Page<CaseDiaryDTO>> getAllCaseDiaries(
            @RequestParam(required = false) Integer investigationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CaseDiaryDTO> caseDiaries = caseDiaryService.getAllCaseDiariesWithFilters(
                investigationId != null ? String.valueOf(investigationId) : null, startDate, endDate, pageable);
        return ResponseEntity.ok(caseDiaries);
    }

    @GetMapping("/search")
    @Operation(summary = "Search case diary entries", description = "Searches case diary entries by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<CaseDiaryDTO>> searchCaseDiaries(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CaseDiaryDTO> caseDiaries = caseDiaryService.searchCaseDiaries(keyword, pageable);
        return ResponseEntity.ok(caseDiaries);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update case diary entry", description = "Updates an existing case diary entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Case diary entry updated successfully"),
            @ApiResponse(responseCode = "404", description = "Case diary entry not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<CaseDiaryDTO> updateCaseDiary(
            @Parameter(description = "Diary ID") @PathVariable Integer id,
            @RequestBody CaseDiaryRequestDTO requestDTO) {
        CaseDiaryDTO caseDiary = caseDiaryService.updateCaseDiary(id, requestDTO);
        return ResponseEntity.ok(caseDiary);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete case diary entry", description = "Deletes a case diary entry by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Case diary entry deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Case diary entry not found")
    })
    public ResponseEntity<Void> deleteCaseDiary(@Parameter(description = "Diary ID") @PathVariable Integer id) {
        caseDiaryService.deleteCaseDiary(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count/investigation/{investigationId}")
    @Operation(summary = "Count case diary entries by investigation", description = "Returns the count of case diary entries for a specific investigation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<Long> countByInvestigationId(@Parameter(description = "Investigation ID") @PathVariable Integer investigationId) {
        long count = caseDiaryService.countByInvestigationId(String.valueOf(investigationId));
        return ResponseEntity.ok(count);
    }
}
