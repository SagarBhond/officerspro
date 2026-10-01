package com.configserver.officerspro.investigationandcasediaryservice.controller;

import com.configserver.officerspro.investigationandcasediaryservice.dto.*;
import com.configserver.officerspro.investigationandcasediaryservice.service.EvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.servlet.HandlerMapping;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/evidence")
@Tag(name = "Evidence Management", description = "APIs for managing evidence")
//@CrossOrigin(origins = "*")
public class EvidenceController {

    private static final Logger logger = LoggerFactory.getLogger(EvidenceController.class);

    @Autowired
    private EvidenceService evidenceService;

    private static final String UPLOAD_DIR = "uploads/evidence/";

    @PostMapping("/create")
    @Operation(summary = "Create evidence", description = "Creates a new evidence record with optional file upload")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Evidence created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<EvidenceDTO> createEvidence(
            @RequestPart("evidenceRequest") EvidenceRequestDTO requestDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        logger.info("📦 ===== CREATING EVIDENCE (Backend) =====");
        logger.info("📋 Evidence Request DTO: {}", requestDTO);
        logger.info("📁 File: {}", file != null ? file.getOriginalFilename() : "No file");
        logger.info("🔍 Investigation ID: {}", requestDTO.getInvestigationId());
        logger.info("🔍 Investigation Internal ID: {}", requestDTO.getInvestigationInternalId());
        
        // If file is provided, use the upload evidence flow
        if (file != null && !file.isEmpty()) {
            logger.info("✅ File provided - using uploadEvidence flow");
            EvidenceDTO evidence = evidenceService.uploadEvidence(
                    requestDTO.getInvestigationId(), 
                    requestDTO, 
                    file);
            logger.info("✅ Evidence created with ID: {}", evidence.getEvidenceId());
            return new ResponseEntity<>(evidence, HttpStatus.CREATED);
        } else {
            logger.info("ℹ️ No file provided - creating evidence record only");
            // No file, just create evidence record
            EvidenceDTO evidence = evidenceService.createEvidence(requestDTO);
            logger.info("✅ Evidence created with ID: {}", evidence.getEvidenceId());
            return new ResponseEntity<>(evidence, HttpStatus.CREATED);
        }
    }

    @PostMapping("/{investigationId}/upload")
    @Operation(summary = "Upload evidence with file", description = "Uploads evidence with associated file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Evidence uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<EvidenceDTO> uploadEvidence(
            @Parameter(description = "Investigation ID") @PathVariable Integer investigationId,
            @RequestPart("evidence") EvidenceRequestDTO evidenceRequest,
            @RequestPart("file") MultipartFile file) {
        EvidenceDTO evidence = evidenceService.uploadEvidence(String.valueOf(investigationId), evidenceRequest, file);
        return new ResponseEntity<>(evidence, HttpStatus.CREATED);
    }

    @GetMapping("/entry/{internalId}")
    @Operation(summary = "Get evidence by investigation internal ID", description = "Retrieves all evidence for a specific investigation entry by its internal ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence retrieved successfully")
    })
    public ResponseEntity<List<EvidenceDTO>> getEvidenceByInternalId(@Parameter(description = "Investigation Internal ID") @PathVariable Integer internalId) {
        logger.info("🔍 ===== GET EVIDENCE BY INTERNAL ID (Controller) =====");
        logger.info("🔍 Received internal ID: {}", internalId);
        
        try {
            if (internalId == null) {
                logger.warn("⚠️ Internal ID is null");
                return ResponseEntity.badRequest().body(new java.util.ArrayList<>());
            }
            
            List<EvidenceDTO> evidence = evidenceService.getEvidenceByInternalId(internalId);
            logger.info("✅ Found {} evidence items for internal ID {}", evidence.size(), internalId);
            
            return ResponseEntity.ok(evidence);
        } catch (Exception e) {
            logger.error("❌ Error fetching evidence for internal ID {}: {}", internalId, e.getMessage(), e);
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/investigation/{investigationId:.+}")
    @Operation(summary = "Get evidence by investigation ID", description = "Retrieves all evidence for a specific investigation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence retrieved successfully")
    })
    public ResponseEntity<List<EvidenceDTO>> getEvidenceByInvestigationId(@Parameter(description = "Investigation ID") @PathVariable String investigationId) {
        logger.info("🔍 ===== GET EVIDENCE BY INVESTIGATION ID (Controller) =====");
        logger.info("🔍 Received investigation ID: {}", investigationId);
        logger.info("🔍 Investigation ID type: {}", investigationId.getClass().getName());
        logger.info("🔍 Investigation ID length: {}", investigationId.length());
        
        try {
            if (investigationId == null || investigationId.trim().isEmpty()) {
                logger.warn("⚠️ Investigation ID is null or empty");
                return ResponseEntity.badRequest().body(new java.util.ArrayList<>());
            }
            
            List<EvidenceDTO> evidence = evidenceService.getEvidenceByInvestigationId(investigationId);
            logger.info("✅ Found {} evidence items for investigation {}", evidence.size(), investigationId);
            
            if (evidence.isEmpty()) {
                logger.warn("⚠️ No evidence found for investigation ID: {}", investigationId);
                return ResponseEntity.ok(new java.util.ArrayList<>());
            } else {
                evidence.forEach(e -> logger.info("📦 Returning evidence: ID={}, Name={}, FilePath={}", 
                    e.getEvidenceId(), e.getEvidenceName(), e.getFilePath()));
            }
            
            return ResponseEntity.ok(evidence);
        } catch (Exception e) {
            logger.error("❌ Error fetching evidence for investigation {}: {}", investigationId, e.getMessage(), e);
            logger.error("❌ Stack trace:", e);
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get evidence by ID", description = "Retrieves a specific evidence by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence found"),
            @ApiResponse(responseCode = "404", description = "Evidence not found")
    })
    public ResponseEntity<EvidenceDTO> getEvidenceById(@Parameter(description = "Evidence ID") @PathVariable Integer id) {
        return evidenceService.getEvidenceById(id)
                .map(evidence -> ResponseEntity.ok(evidence))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all evidence with optional filters", description = "Retrieves evidence with pagination and optional filtering")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence retrieved successfully")
    })
    public ResponseEntity<Page<EvidenceDTO>> getAllEvidence(
            @RequestParam(required = false) Integer investigationId,
            @RequestParam(required = false) String evidenceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<EvidenceDTO> evidence = evidenceService.getAllEvidenceWithFilters(
                investigationId != null ? String.valueOf(investigationId) : null, 
                evidenceType, pageable);
        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/search")
    @Operation(summary = "Search evidence", description = "Searches evidence by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<EvidenceDTO>> searchEvidence(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<EvidenceDTO> evidence = evidenceService.searchEvidence(keyword, pageable);
        return ResponseEntity.ok(evidence);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update evidence", description = "Updates an existing evidence")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence updated successfully"),
            @ApiResponse(responseCode = "404", description = "Evidence not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<EvidenceDTO> updateEvidence(
            @Parameter(description = "Evidence ID") @PathVariable Integer id,
            @RequestBody EvidenceRequestDTO requestDTO) {
        return evidenceService.updateEvidence(id, requestDTO)
                .map(evidence -> ResponseEntity.ok(evidence))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete evidence", description = "Deletes an evidence by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Evidence deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Evidence not found")
    })
    public ResponseEntity<Void> deleteEvidence(@Parameter(description = "Evidence ID") @PathVariable Integer id) {
        logger.info("🗑️ Deleting evidence with ID: {}", id);
        boolean deleted = evidenceService.deleteEvidence(id);
        if (deleted) {
            logger.info("✅ Evidence deleted successfully: {}", id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warn("⚠️ Evidence not found for deletion: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{evidenceId}/file")
    @Operation(summary = "Update evidence file", description = "Updates the file associated with an evidence")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Evidence file updated successfully"),
            @ApiResponse(responseCode = "404", description = "Evidence not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<EvidenceDTO> updateEvidenceFile(
            @Parameter(description = "Evidence ID") @PathVariable Integer evidenceId,
            @RequestPart("file") MultipartFile file) {
        try {
            // Get existing evidence
            Optional<EvidenceDTO> existingEvidenceOpt = evidenceService.getEvidenceById(evidenceId);
            if (existingEvidenceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            EvidenceDTO existingEvidence = existingEvidenceOpt.get();

            // Upload new file as document
            DocumentRequestDTO documentRequest = DocumentRequestDTO.builder()
                    .documentType("EVIDENCE")
                    .uploadedBy(1) // TODO: Get from security context
                    .investigationId(existingEvidence.getInvestigationId())
                    .fileName(file.getOriginalFilename())
                    .description("Updated evidence file for evidence " + evidenceId)
                    .build();

            DocumentDTO document = evidenceService.uploadDocument(documentRequest, file);

            // Update evidence with new file info
            EvidenceRequestDTO evidenceRequest = EvidenceRequestDTO.builder()
                    .investigationId(existingEvidence.getInvestigationId())
                    .evidenceName(existingEvidence.getEvidenceName())
                    .description(existingEvidence.getDescription())
                    .evidenceType(existingEvidence.getEvidenceType())
                    .fileType(file.getContentType())
                    .build();

            Optional<EvidenceDTO> updatedEvidence = evidenceService.updateEvidence(evidenceId, evidenceRequest);
            return updatedEvidence.map(evidence -> ResponseEntity.ok(evidence))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count/investigation/{investigationId}")
    @Operation(summary = "Count evidence by investigation ID", description = "Returns the count of evidence for a specific investigation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<Long> countByInvestigationId(@Parameter(description = "Investigation ID") @PathVariable Integer investigationId) {
        long count = evidenceService.countByInvestigationId(String.valueOf(investigationId));
        return ResponseEntity.ok(count);
    }

    // Document management endpoints
    @PostMapping("/document")
    @Operation(summary = "Upload document", description = "Uploads a document file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestPart("document") DocumentRequestDTO documentRequest,
            @RequestPart("file") MultipartFile file) {
        DocumentDTO document = evidenceService.uploadDocument(documentRequest, file);
        return new ResponseEntity<>(document, HttpStatus.CREATED);
    }

    @GetMapping("/file/**")
    @Operation(summary = "Download file by path", description = "Downloads a file by its path")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "File downloaded successfully"),
            @ApiResponse(responseCode = "404", description = "File not found")
    })
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        try {
            // Extract file path from URL
            String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            logger.info("📄 Download file request received. Full path: {}", path);
            
            // Remove the /api/evidence/file/ prefix
            String filePath = path.replaceFirst("/api/evidence/file/", "");
            logger.info("📄 Extracted file path: {}", filePath);

            // Decode URL
            filePath = URLDecoder.decode(filePath, StandardCharsets.UTF_8);
            logger.info("📄 Decoded file path: {}", filePath);

            // Handle both old format (with uploads/evidence/) and new format (just filename)
            Path fullPath;
            if (filePath.startsWith("uploads/evidence/") || filePath.startsWith("uploads\\evidence\\")) {
                // Old format: path already includes uploads/evidence/
                logger.info("📄 Using old format (full path in database)");
                fullPath = Paths.get(filePath);
            } else {
                // New format: just filename, need to prepend UPLOAD_DIR
                logger.info("📄 Using new format (filename only in database)");
                fullPath = Paths.get(UPLOAD_DIR, filePath);
            }
            logger.info("📄 Full file system path: {}", fullPath.toAbsolutePath());
            
            Resource resource = new UrlResource(fullPath.toUri());

            if (resource.exists() && resource.isReadable()) {
                logger.info("✅ File found and readable");
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(fullPath);
                    if (contentType == null) {
                        contentType = "application/octet-stream";
                    }
                } catch (IOException e) {
                    logger.warn("⚠️ Could not determine content type: {}", e.getMessage());
                }

                logger.info("📄 Content type: {}", contentType);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + Paths.get(filePath).getFileName().toString() + "\"")
                        .body(resource);
            } else {
                logger.error("❌ File not found or not readable: {}", fullPath.toAbsolutePath());
                logger.error("❌ File exists: {}", resource.exists());
                logger.error("❌ File readable: {}", resource.isReadable());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("❌ Error downloading file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/document/{id}")
    @Operation(summary = "Get document by ID", description = "Retrieves a specific document by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document found"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<DocumentDTO> getDocumentById(@Parameter(description = "Document ID") @PathVariable Integer id) {
        return evidenceService.getDocumentById(id)
                .map(document -> ResponseEntity.ok(document))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/document/type/{documentType}")
    @Operation(summary = "Get documents by type", description = "Retrieves all documents of a specific type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents retrieved successfully")
    })
    public ResponseEntity<List<DocumentDTO>> getDocumentsByType(@Parameter(description = "Document type") @PathVariable String documentType) {
        List<DocumentDTO> documents = evidenceService.getDocumentsByType(documentType);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/document/search")
    @Operation(summary = "Search documents", description = "Searches documents by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<DocumentDTO>> searchDocuments(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentDTO> documents = evidenceService.searchDocuments(keyword, pageable);
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/document/{id}")
    @Operation(summary = "Delete document", description = "Deletes a document by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Void> deleteDocument(@Parameter(description = "Document ID") @PathVariable Integer id) {
        return evidenceService.deleteDocument(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // Panchnama management endpoints
    @PostMapping("/panchnama")
    @Operation(summary = "Create panchnama", description = "Creates a new panchnama record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Panchnama created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<PanchnamaDTO> createPanchnama(@RequestBody PanchnamaRequestDTO requestDTO) {
        PanchnamaDTO panchnama = evidenceService.createPanchnama(requestDTO);
        return new ResponseEntity<>(panchnama, HttpStatus.CREATED);
    }

    @GetMapping("/panchnama/{id}")
    @Operation(summary = "Get panchnama by ID", description = "Retrieves a specific panchnama by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Panchnama found"),
            @ApiResponse(responseCode = "404", description = "Panchnama not found")
    })
    public ResponseEntity<PanchnamaDTO> getPanchnamaById(@Parameter(description = "Panchnama ID") @PathVariable Integer id) {
        return evidenceService.getPanchnamaById(id)
                .map(panchnama -> ResponseEntity.ok(panchnama))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/panchnama/evidence/{evidenceId}")
    @Operation(summary = "Get panchnamas by evidence ID", description = "Retrieves all panchnamas for a specific evidence")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Panchnamas retrieved successfully")
    })
    public ResponseEntity<List<PanchnamaDTO>> getPanchnamasByEvidenceId(@Parameter(description = "Evidence ID") @PathVariable Integer evidenceId) {
        List<PanchnamaDTO> panchnamas = evidenceService.getPanchnamasByEvidenceId(evidenceId);
        return ResponseEntity.ok(panchnamas);
    }

    @GetMapping("/panchnama/search")
    @Operation(summary = "Search panchnamas", description = "Searches panchnamas by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<PanchnamaDTO>> searchPanchnamas(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PanchnamaDTO> panchnamas = evidenceService.searchPanchnamas(keyword, pageable);
        return ResponseEntity.ok(panchnamas);
    }

    @PutMapping("/panchnama/{id}")
    @Operation(summary = "Update panchnama", description = "Updates an existing panchnama")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Panchnama updated successfully"),
            @ApiResponse(responseCode = "404", description = "Panchnama not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<PanchnamaDTO> updatePanchnama(
            @Parameter(description = "Panchnama ID") @PathVariable Integer id,
            @RequestBody PanchnamaRequestDTO requestDTO) {
        return evidenceService.updatePanchnama(id, requestDTO)
                .map(panchnama -> ResponseEntity.ok(panchnama))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/panchnama/{id}")
    @Operation(summary = "Delete panchnama", description = "Deletes a panchnama by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Panchnama deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Panchnama not found")
    })
    public ResponseEntity<Void> deletePanchnama(@Parameter(description = "Panchnama ID") @PathVariable Integer id) {
        return evidenceService.deletePanchnama(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // Forensic Report management endpoints
    @PostMapping("/forensic-report")
    @Operation(summary = "Create forensic report", description = "Creates a new forensic report record")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Forensic report created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<ForensicReportDTO> createForensicReport(@RequestBody ForensicReportRequestDTO requestDTO) {
        ForensicReportDTO forensicReport = evidenceService.createForensicReport(requestDTO);
        return new ResponseEntity<>(forensicReport, HttpStatus.CREATED);
    }

    @GetMapping("/forensic-report/{id}")
    @Operation(summary = "Get forensic report by ID", description = "Retrieves a specific forensic report by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Forensic report found"),
            @ApiResponse(responseCode = "404", description = "Forensic report not found")
    })
    public ResponseEntity<ForensicReportDTO> getForensicReportById(@Parameter(description = "Forensic report ID") @PathVariable Integer id) {
        return evidenceService.getForensicReportById(id)
                .map(forensicReport -> ResponseEntity.ok(forensicReport))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/forensic-report/evidence/{evidenceId}")
    @Operation(summary = "Get forensic reports by evidence ID", description = "Retrieves all forensic reports for a specific evidence")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Forensic reports retrieved successfully")
    })
    public ResponseEntity<List<ForensicReportDTO>> getForensicReportsByEvidenceId(@Parameter(description = "Evidence ID") @PathVariable Integer evidenceId) {
        List<ForensicReportDTO> forensicReports = evidenceService.getForensicReportsByEvidenceId(evidenceId);
        return ResponseEntity.ok(forensicReports);
    }

    @GetMapping("/forensic-report/lab/{labName}")
    @Operation(summary = "Get forensic reports by lab name", description = "Retrieves all forensic reports from a specific lab")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Forensic reports retrieved successfully")
    })
    public ResponseEntity<List<ForensicReportDTO>> getForensicReportsByLabName(@Parameter(description = "Lab name") @PathVariable String labName) {
        List<ForensicReportDTO> forensicReports = evidenceService.getForensicReportsByLabName(labName);
        return ResponseEntity.ok(forensicReports);
    }

    @GetMapping("/forensic-report/search")
    @Operation(summary = "Search forensic reports", description = "Searches forensic reports by keyword")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<ForensicReportDTO>> searchForensicReports(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ForensicReportDTO> forensicReports = evidenceService.searchForensicReports(keyword, pageable);
        return ResponseEntity.ok(forensicReports);
    }

    @PutMapping("/forensic-report/{id}")
    @Operation(summary = "Update forensic report", description = "Updates an existing forensic report")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Forensic report updated successfully"),
            @ApiResponse(responseCode = "404", description = "Forensic report not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<ForensicReportDTO> updateForensicReport(
            @Parameter(description = "Forensic report ID") @PathVariable Integer id,
            @RequestBody ForensicReportRequestDTO requestDTO) {
        return evidenceService.updateForensicReport(id, requestDTO)
                .map(forensicReport -> ResponseEntity.ok(forensicReport))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/forensic-report/{id}")
    @Operation(summary = "Delete forensic report", description = "Deletes a forensic report by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Forensic report deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Forensic report not found")
    })
    public ResponseEntity<Void> deleteForensicReport(@Parameter(description = "Forensic report ID") @PathVariable Integer id) {
        return evidenceService.deleteForensicReport(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
