package com.configserver.officerspro.complainandfirservice.controller;

import com.configserver.officerspro.complainandfirservice.dto.ComplaintRequestDTO;
import com.configserver.officerspro.complainandfirservice.dto.ComplaintResponseDTO;
import com.configserver.officerspro.complainandfirservice.dto.FIRRequestDTO;
import com.configserver.officerspro.complainandfirservice.dto.chargesheet.*;
import com.configserver.officerspro.complainandfirservice.entity.Citizen;
import com.configserver.officerspro.complainandfirservice.entity.ComplaintParticipant;
import com.configserver.officerspro.complainandfirservice.entity.FIR;
import com.configserver.officerspro.complainandfirservice.entity.WrittenComplaint;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import com.configserver.officerspro.complainandfirservice.exception.ComplaintExceptionFactory;
import com.configserver.officerspro.complainandfirservice.exception.ComplaintNotFoundException;
import com.configserver.officerspro.complainandfirservice.exception.FileProcessingException;
import com.configserver.officerspro.complainandfirservice.repository.FIRRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRVictimRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRAccusedRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRWitnessRepository;
import com.configserver.officerspro.complainandfirservice.repository.WrittenComplaintRepository;
import com.configserver.officerspro.complainandfirservice.service.ComplaintService;
import com.configserver.officerspro.complainandfirservice.service.StatementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

//@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/victim")
@RequiredArgsConstructor
public class ComplaintController {

    private static final Logger logger = LoggerFactory.getLogger(
        ComplaintController.class
    );

    private final ComplaintService service;
    private final StatementService statementService;
    private final WrittenComplaintRepository complaintRepo;
    private final FIRRepository firRepo;
    private final FIRVictimRepository victimRepo;
    private final FIRAccusedRepository accusedRepo;
    private final FIRWitnessRepository witnessRepo;

    @PostMapping(
        value = "/report",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ComplaintResponseDTO> registerStatement(
        @RequestPart("complaintDto") ComplaintRequestDTO dto,
        @RequestPart(
            value = "complainantFiles",
            required = false
        ) MultipartFile[] complainantFiles,
        @RequestPart(
            value = "offenderFiles",
            required = false
        ) MultipartFile[] offenderFiles,
        @RequestPart(
            value = "witnessFiles",
            required = false
        ) MultipartFile[] witnessFiles
    ) throws FileProcessingException {
        try {
            WrittenComplaint complaint = service.registerStatement(
                dto,
                complainantFiles,
                offenderFiles,
                witnessFiles
            );
            ComplaintResponseDTO response = statementService.mapToResponseDTO(
                complaint
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw ComplaintExceptionFactory.create(
                "OFSCFS009",
                "Failed to register statement: " + e.getMessage()
            );
        }
    }

    @GetMapping("/statements")
    public ResponseEntity<Page<ComplaintResponseDTO>> getAllStatements(
        @RequestParam(required = false) ComplaintStatus status,
        @RequestParam(required = false) Integer createdBy,
        @RequestParam(required = false) Integer stationId,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE_TIME
        ) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(
            iso = DateTimeFormat.ISO.DATE_TIME
        ) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponseDTO> statements =
            statementService.getAllStatements(
                status,
                createdBy,
                stationId,
                startDate,
                endDate,
                pageable
            );
        return ResponseEntity.ok(statements);
    }

    @GetMapping("/statements/{complaintId}/has-fir")
    public ResponseEntity<Boolean> hasFIR(@PathVariable String complaintId) {
        logger.info("Checking if complaint {} has FIR", complaintId);
        boolean hasFir = statementService.hasFIR(complaintId);
        logger.info("Complaint {} hasFIR: {}", complaintId, hasFir);
        return ResponseEntity.ok(hasFir);
    }

    @PutMapping(
        value = "/statements/{complaintId}/update",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ComplaintResponseDTO> updateStatementWithFiles(
        @PathVariable String complaintId,
        @RequestPart("complaintDto") ComplaintRequestDTO dto,
        @RequestPart(
            value = "complainantFiles",
            required = false
        ) MultipartFile[] complainantFiles,
        @RequestPart(
            value = "offenderFiles",
            required = false
        ) MultipartFile[] offenderFiles,
        @RequestPart(
            value = "witnessFiles",
            required = false
        ) MultipartFile[] witnessFiles
    ) throws FileProcessingException {
        try {
            WrittenComplaint complaint = service.updateStatement(
                complaintId,
                dto,
                complainantFiles,
                offenderFiles,
                witnessFiles
            );
            ComplaintResponseDTO response = statementService.mapToResponseDTO(
                complaint
            );
            return ResponseEntity.ok(response);
        } catch (ComplaintNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw ComplaintExceptionFactory.create(
                "OFSCFS009",
                "Failed to update statement: " + e.getMessage()
            );
        }
    }

    @PostMapping(
        value = "/statements/{complaintId}/register-fir",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> registerFIRWithSections(
        @PathVariable String complaintId,
        @RequestPart("firData") String firDataJson,
        @RequestPart(value = "firFile", required = false) MultipartFile firFile
    ) throws IOException {
        logger.info("📥 Register FIR request received for complaint: {}", complaintId);
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            FIRRequestDTO firData = objectMapper.readValue(
                firDataJson,
                FIRRequestDTO.class
            );

            FIR fir = statementService.registerFIRWithSections(
                complaintId,
                firData,
                firFile
            );

            Map<String, Object> response = new HashMap<>();
            response.put("firId", fir.getFirId());
            response.put("sections", fir.getSections());
            response.put("description", fir.getDescription());
            response.put("status", fir.getStatus());
            response.put("registeredOn", fir.getRegisteredOn());
            response.put("complaintId", complaintId);
            
            logger.info("✅ FIR registered successfully. Response: {}", response);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error(
                "Failed to register FIR for complaint {}: {}",
                complaintId,
                e.getMessage(),
                e
            );
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to register FIR");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("complaintId", complaintId);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/statements/{complaintId}/fir-details")
    public ResponseEntity<Map<String, Object>> getFIRDetails(
        @PathVariable String complaintId
    ) {
        if (!statementService.hasFIR(complaintId)) {
            return ResponseEntity.notFound().build();
        }

        FIR fir = statementService.getFIRByComplaintId(complaintId);
        if (fir == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(createFIRInfoMap(fir, complaintId));
    }

    @GetMapping("/statements/{complaintId}")
    public ResponseEntity<ComplaintResponseDTO> getStatementById(
        @PathVariable String complaintId
    ) {
        WrittenComplaint complaint = complaintRepo
            .findByIdWithParticipants(complaintId)
            .orElseThrow(() ->
                new ComplaintNotFoundException(
                    "Complaint not found with ID: " + complaintId
                )
            );

        ComplaintResponseDTO response = statementService.mapToResponseDTO(
            complaint
        );
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createFIRInfoMap(FIR fir, String complaintId) {
        Map<String, Object> firInfo = new HashMap<>();
        firInfo.put("hasFIR", true);
        firInfo.put("firId", fir.getFirId());
        firInfo.put("sections", fir.getSections());
        firInfo.put("description", fir.getDescription());
        firInfo.put("firDocumentPath", fir.getFirDocumentPath());
        firInfo.put("registeredOn", fir.getRegisteredOn());
        firInfo.put("officerId", fir.getOfficerId());
        firInfo.put("status", fir.getStatus());
        firInfo.put("complaintId", complaintId);
        return firInfo;
    }

    /**
     * ChargeSheet Integration Endpoint
     * GET /api/victim/chargesheet/fir/{firCode}
     * Returns FIR details in ChargeSheet-compatible format
     */
    @GetMapping("/chargesheet/fir/{firId}")
    public ResponseEntity<FIRDetailsForChargesheetDTO> getFIRForChargesheet(@PathVariable String firId) {
        logger.info("ChargeSheet Integration: Fetching FIR details for ID: {}", firId);
        
        // Find FIR by ID (which is now the string-based code)
        FIR fir = firRepo.findById(firId)
                .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));
        
        WrittenComplaint complaint = fir.getComplaint();
        
        // Parse IPC sections
        List<String> ipcSections = new ArrayList<>();
        if (fir.getSections() != null && !fir.getSections().isEmpty()) {
            ipcSections = Arrays.stream(fir.getSections().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
        }
        
        // Build response
        FIRDetailsForChargesheetDTO response = FIRDetailsForChargesheetDTO.builder()
                .firId(fir.getFirId())
                .complaintId(complaint.getComplaintId())
                .firDate(fir.getRegisteredOn())
                .policeStation("Pune Cyber Police Station") // TODO: Fetch from station service
                .officerInCharge("Investigating Officer") // TODO: Fetch from officer service
                .ipcSections(ipcSections)
                .complaintDetails(ComplaintDetailsDTO.builder()
                        .subject(complaint.getSubject())
                        .description(complaint.getDescription())
                        .build())
                .participants(buildParticipantsDTO(complaint))
                .documents(new ArrayList<>()) // TODO: Fetch from document service
                .build();
        
        logger.info("ChargeSheet Integration: Successfully fetched FIR details for: {}", firId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Build participants DTO grouped by role
     */
    private ParticipantsDTO buildParticipantsDTO(WrittenComplaint complaint) {
        return ParticipantsDTO.builder()
                .complainants(complaint.getParticipants().stream()
                        .filter(p -> p.getRole() == ParticipantRole.COMPLAINANT || 
                                     p.getRole() == ParticipantRole.CO_COMPLAINANT)
                        .map(this::mapToCitizenDTO)
                        .collect(Collectors.toList()))
                .victims(new ArrayList<>()) // Same as complainants in most cases
                .accused(complaint.getParticipants().stream()
                        .filter(p -> p.getRole() == ParticipantRole.OFFENDER)
                        .map(this::mapToCitizenDTO)
                        .collect(Collectors.toList()))
                .witnesses(complaint.getParticipants().stream()
                        .filter(p -> p.getRole() == ParticipantRole.WITNESS)
                        .map(this::mapToCitizenDTO)
                        .collect(Collectors.toList()))
                .build();
    }
    
    /**
     * Map ComplaintParticipant to CitizenDTO
     */
    private CitizenDTO mapToCitizenDTO(ComplaintParticipant participant) {
        Citizen c = participant.getCitizen();
        return CitizenDTO.builder()
                .citizenId(c.getCitizenId())
                .name(c.getName())
                .address(c.getAddress())
                .contactNumber(c.getContactNo())  // Fixed: use getContactNo() instead of getContactNumber()
                .aadharNo(c.getAadharNo())
                .email(c.getEmail())
                .status(null) // TODO: Add status field if needed
                .build();
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Backend is running successfully!");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "Complaint and FIR Service");
        return ResponseEntity.ok(response);
    }


    @GetMapping("/error-codes")
    public ResponseEntity<Map<String, Object>> getErrorCodes() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Complaint and FIR Service");
        response.put("version", "1.0");
        response.put(
            "errorCodes",
            Map.of(
                "OFSCFS001",
                Map.of(
                    "description",
                    "Complaint not found",
                    "httpStatus",
                    404,
                    "message",
                    "The requested complaint could not be found"
                ),
                "OFSCFS006",
                Map.of(
                    "description",
                    "File processing failed",
                    "httpStatus",
                    500,
                    "message",
                    "An error occurred while processing uploaded files"
                ),
                "OFSCFS009",
                Map.of(
                    "description",
                    "General service operation failed",
                    "httpStatus",
                    500,
                    "message",
                    "An unexpected error occurred during the operation"
                )
            )
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get FIR details by FIR ID for Case Diary integration
     * GET /api/victim/fir/{firId}
     */
    @GetMapping("/fir/{firId}")
    public ResponseEntity<Map<String, Object>> getFIRByFirId(@PathVariable String firId) {
        logger.info("🔍 Fetching FIR details for FIR ID: {}", firId);
        
        try {
            // Find FIR by ID
            FIR fir = firRepo.findById(firId)
                    .orElseThrow(() -> new RuntimeException("FIR not found with ID: " + firId));
            
            logger.info("✅ FIR found: {}", firId);
            logger.info("📋 FIR Description: {}", fir.getDescription());
            logger.info("📋 FIR Sections: {}", fir.getSections());
            
            WrittenComplaint complaint = fir.getComplaint();
            logger.info("📋 Complaint ID: {}", complaint != null ? complaint.getComplaintId() : "null");
            
            // Get victims
            List<Map<String, Object>> victims = victimRepo.findByFirFirId(firId).stream()
                    .map(victim -> {
                        Map<String, Object> v = new HashMap<>();
                        Citizen citizen = victim.getCitizen();
                        if (citizen != null) {
                            v.put("victimId", citizen.getCitizenId());
                            v.put("victimName", citizen.getName());
                            v.put("victimAge", citizen.getAge());
                            v.put("victimAddress", citizen.getAddress());
                            v.put("victimMobileNo", citizen.getContactNo());
                            v.put("victimProfession", citizen.getProfession());
                        }
                        return v;
                    }).collect(Collectors.toList());
            
            logger.info("👥 Found {} victims for FIR {}", victims.size(), firId);
            
            // Get accused
            List<Map<String, Object>> accused = accusedRepo.findByFirFirId(firId).stream()
                    .map(acc -> {
                        Map<String, Object> a = new HashMap<>();
                        Citizen citizen = acc.getCitizen();
                        if (citizen != null) {
                            a.put("accusedId", citizen.getCitizenId());
                            a.put("accusedName", citizen.getName());
                            a.put("accusedAge", citizen.getAge());
                            a.put("accusedAddress", citizen.getAddress());
                        }
                        a.put("arrestStatus", "Not Arrested"); // Default, update if you have arrest status field
                        return a;
                    }).collect(Collectors.toList());
            
            logger.info("🚨 Found {} accused for FIR {}", accused.size(), firId);
            
            // Get witnesses
            List<Map<String, Object>> witnesses = witnessRepo.findByFir_FirId(firId).stream()
                    .map(wit -> {
                        Map<String, Object> w = new HashMap<>();
                        Citizen citizen = wit.getCitizen();
                        if (citizen != null) {
                            w.put("witnessId", citizen.getCitizenId());
                            w.put("witnessName", citizen.getName());
                            w.put("witnessAge", citizen.getAge());
                            w.put("witnessAddress", citizen.getAddress());
                            w.put("witnessContactNumber", citizen.getContactNo());
                        }
                        return w;
                    }).collect(Collectors.toList());
            
            logger.info("👁️ Found {} witnesses for FIR {}", witnesses.size(), firId);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("firId", fir.getFirId());
            response.put("sections", fir.getSections());
            response.put("description", fir.getDescription());
            response.put("registeredOn", fir.getRegisteredOn());
            response.put("status", fir.getStatus());
            response.put("firDocumentPath", fir.getFirDocumentPath());
            
            // Complaint details
            if (complaint != null) {
                Map<String, Object> complaintDetails = new HashMap<>();
                complaintDetails.put("complaintId", complaint.getComplaintId());
                complaintDetails.put("subject", complaint.getSubject());
                complaintDetails.put("description", complaint.getDescription());
                complaintDetails.put("filedDate", complaint.getFiledDate());
                complaintDetails.put("crimeDateTime", complaint.getCrimeDateTime());
                complaintDetails.put("status", complaint.getStatus());
                response.put("complaint", complaintDetails);
                
                // Also add crime date/time to root response for easier access
                response.put("crimeDateTime", complaint.getCrimeDateTime());
            }
            
            response.put("victims", victims);
            response.put("accused", accused);
            response.put("witnesses", witnesses);
            
            logger.info("✅ Successfully fetched FIR details for: {}", firId);
            logger.info("📦 Response contains: {} victims, {} accused, {} witnesses", 
                victims.size(), accused.size(), witnesses.size());
            logger.info("📋 Response sections: {}, description length: {}", 
                fir.getSections(), fir.getDescription() != null ? fir.getDescription().length() : 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error fetching FIR details for {}: {}", firId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch FIR details: " + e.getMessage()));
        }
    }
}
