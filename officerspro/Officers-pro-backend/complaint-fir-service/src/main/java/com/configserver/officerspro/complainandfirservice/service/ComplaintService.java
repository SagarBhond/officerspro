package com.configserver.officerspro.complainandfirservice.service;

import com.configserver.officerspro.complainandfirservice.audit.ActionType;
import com.configserver.officerspro.complainandfirservice.audit.AuditTrailRequestDTO;
import com.configserver.officerspro.complainandfirservice.client.AuditClient;
import com.configserver.officerspro.complainandfirservice.client.DocumentServiceClient;
import com.configserver.officerspro.complainandfirservice.dto.ComplaintParticipantDTO;
import com.configserver.officerspro.complainandfirservice.dto.ComplaintRequestDTO;
import com.configserver.officerspro.complainandfirservice.entity.Citizen;
import com.configserver.officerspro.complainandfirservice.entity.ComplaintParticipant;
import com.configserver.officerspro.complainandfirservice.entity.WrittenComplaint;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import com.configserver.officerspro.complainandfirservice.exception.ComplaintExceptionFactory;
import com.configserver.officerspro.complainandfirservice.exception.ComplaintNotFoundException;
import com.configserver.officerspro.complainandfirservice.exception.ComplaintServiceException;
import com.configserver.officerspro.complainandfirservice.exception.FileProcessingException;
import com.configserver.officerspro.complainandfirservice.mapper.EntityMapper;
import com.configserver.officerspro.complainandfirservice.repository.CitizenRepository;
import com.configserver.officerspro.complainandfirservice.repository.ComplaintParticipantRepository;
import com.configserver.officerspro.complainandfirservice.repository.WrittenComplaintRepository;
import com.configserver.officerspro.complainandfirservice.util.CodeGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(
            ComplaintService.class
    );

    private final WrittenComplaintRepository complaintRepo;
    private final CitizenRepository citizenRepo;
    private final ComplaintParticipantRepository participantRepo;
    private final DocumentServiceClient documentServiceClient; // ADD THIS LINE
    private final ImageCompressionService imageCompressionService;
    private final PgpEncryptionService pgpEncryptionService;
    private final EntityMapper mapper;
    private final AuditClient auditClient;
    private final ObjectMapper objectMapper;
    private final CodeGenerator codeGenerator;
    private final String uploadDir = "uploads/citizens/";

    private void processCitizenFile(Citizen citizen, MultipartFile file)
            throws IOException {
        try {
            String fileName = file.getOriginalFilename().toLowerCase();

            // Determine document type/tag from filename
            String tag = "CITIZEN_DOCUMENT";
            if (fileName.contains("aadhar")) {
                tag = "AADHAR";
            } else if (fileName.contains("pan")) {
                tag = "PAN";
            } else if (fileName.contains("photo")) {
                tag = "PHOTO";
            }

            logger.info(
                    "Uploading citizen document: citizenId={}, fileName={}, tag={}",
                    citizen.getCitizenId(),
                    fileName,
                    tag
            );

            // Upload to document service
            Map<String, Object> response = documentServiceClient.uploadDocument(
                    file,
                    "CITIZEN",
                    citizen.getCitizenId().toString(),
                    tag,
                    citizen.getCreatedBy() != null
                            ? citizen.getCreatedBy().toString()
                            : "1"
            );

            // Extract document ID from response
            Integer documentId = extractDocumentId(response);

            if (documentId == null) {
                logger.error(
                        "Failed to extract documentId from response: {}. Falling back to local storage.",
                        response
                );
                throw new RuntimeException("Document ID is null in response");
            }

            String documentPath = "/documents/" + documentId;

            logger.info(
                    "Document uploaded successfully: documentId={}, path={}",
                    documentId,
                    documentPath
            );

            // Set the appropriate path based on document type
            Map<String, Runnable> fileTypeActions = Map.of(
                    "aadhar",
                    () -> citizen.setAadharPath(documentPath),
                    "pan",
                    () -> citizen.setPanPath(documentPath),
                    "photo",
                    () -> citizen.setPhotoPath(documentPath)
            );

            fileTypeActions
                    .entrySet()
                    .stream()
                    .filter(entry -> fileName.contains(entry.getKey()))
                    .findFirst()
                    .ifPresent(entry -> entry.getValue().run());
        } catch (Exception e) {
            logger.error(
                    "Failed to upload document to document service, falling back to local storage: {}",
                    e.getMessage(),
                    e
            );
            // Fallback to local storage if document service is unavailable
            String path = saveEncryptedFile(file, citizen.getName());
            String fileName = file.getOriginalFilename().toLowerCase();

            Map<String, Runnable> fileTypeActions = Map.of(
                    "aadhar",
                    () -> citizen.setAadharPath(path),
                    "pan",
                    () -> citizen.setPanPath(path),
                    "photo",
                    () -> citizen.setPhotoPath(path)
            );

            fileTypeActions
                    .entrySet()
                    .stream()
                    .filter(entry -> fileName.contains(entry.getKey()))
                    .findFirst()
                    .ifPresent(entry -> entry.getValue().run());
        }
    }

    private String saveEncryptedFile(MultipartFile file, String citizenName)
            throws IOException {
        return Optional.ofNullable(file)
                .map(f -> {
                    try {
                        Path dirPath = Paths.get(uploadDir);
                        if (!Files.exists(dirPath)) Files.createDirectories(
                                dirPath
                        );

                        String fileName =
                                citizenName +
                                        "_" +
                                        System.currentTimeMillis() +
                                        "_" +
                                        f.getOriginalFilename();
                        Path filePath = dirPath.resolve(fileName);

                        byte[] fileData = f.getBytes();
                        String contentType = f.getContentType();
                        boolean isImage =
                                contentType != null &&
                                        (contentType.equals("image/jpeg") ||
                                                contentType.equals("image/jpg") ||
                                                contentType.equals("image/png"));

                        if (isImage) {
                            try {
                                fileData = imageCompressionService.compressImage(
                                        f,
                                        true
                                );
                            } catch (IOException e) {
                                // Continue with original file if compression fails
                            }
                        }

                        byte[] encryptedData = pgpEncryptionService.encryptFile(
                                fileData
                        );
                        Files.write(filePath, encryptedData);

                        return "/citizens/" + fileName;
                    } catch (Exception e) {
                        throw new RuntimeException(
                                "Failed to save encrypted file",
                                e
                        );
                    }
                })
                .orElseThrow(() -> new IOException("File is null"));
    }

    // ADD THIS NEW HELPER METHOD:
    private Integer extractDocumentId(Map<String, Object> response) {
        if (response == null) {
            logger.error("Document service response is null");
            return null;
        }

        Object docId = response.get("documentId");
        if (docId == null) {
            logger.error(
                    "documentId field not found in response: {}",
                    response
            );
            return null;
        }

        if (docId instanceof Integer) {
            return (Integer) docId;
        } else if (docId instanceof Number) {
            return ((Number) docId).intValue();
        }

        logger.error(
                "documentId is not a number. Type: {}, Value: {}",
                docId.getClass(),
                docId
        );
        return null;
    }

    @Transactional
    public WrittenComplaint registerStatement(
            ComplaintRequestDTO dto,
            MultipartFile[] complainantFiles,
            MultipartFile[] offenderFiles,
            MultipartFile[] witnessFiles
    ) throws FileProcessingException {
        try {
            List<Citizen> complainants = saveComplainantCitizens(
                    dto.getParticipants(),
                    dto.getCreatedBy(),
                    complainantFiles
            );
            List<Citizen> accused = saveCitizens(
                    dto.getOffenderParticipants(),
                    ParticipantRole.OFFENDER,
                    dto.getCreatedBy(),
                    offenderFiles
            );
            List<Citizen> witnesses = saveCitizens(
                    dto.getWitnessParticipants(),
                    ParticipantRole.WITNESS,
                    dto.getCreatedBy(),
                    witnessFiles
            );

            //            validateNoDuplicateDTOs(dto.getParticipants(), dto.getOffenderParticipants(), dto.getWitnessParticipants());
            //            validateNoDuplicateCitizens(complainants, accused, witnesses);

            // Generate string-based complaint ID
            String complaintId = codeGenerator.generateNextComplaintId();
            logger.info("Generated complaint ID: {}", complaintId);

            WrittenComplaint complaint = WrittenComplaint.builder()
                    .complaintId(complaintId)
                    .subject(dto.getSubject())
                    .description(dto.getDescription())
                    .crimeAddress(dto.getCrimeAddress())
                    .crimeDateTime(dto.getCrimeDateTime())
                    .filedByStationId(dto.getFiledByStationId())
                    .status(
                            Optional.ofNullable(dto.getStatus()).orElse(
                                    ComplaintStatus.PENDING
                            )
                    )
                    .createdBy(dto.getCreatedBy())
                    .createdOn(LocalDateTime.now())
                    .updatedBy(dto.getUpdatedBy())
                    .updatedOn(dto.getUpdatedOn())
                    .build();

            WrittenComplaint savedComplaint = complaintRepo.save(complaint);

            List<ComplaintParticipant> participants = new ArrayList<>();
            participants.addAll(
                    IntStream.range(0, complainants.size())
                            .mapToObj(i ->
                                    buildParticipant(
                                            complainants.get(i),
                                            savedComplaint,
                                            dto.getParticipants().get(i),
                                            i == 0
                                                    ? ParticipantRole.COMPLAINANT
                                                    : ParticipantRole.CO_COMPLAINANT,
                                            dto.getCreatedBy()
                                    )
                            )
                            .collect(Collectors.toList())
            );
            // After adding complainants and before adding witnesses
            participants.addAll(
                    IntStream.range(0, accused.size())
                            .mapToObj(i ->
                                    buildParticipant(
                                            accused.get(i),
                                            savedComplaint,
                                            dto.getOffenderParticipants().get(i),
                                            ParticipantRole.OFFENDER,
                                            dto.getCreatedBy()
                                    )
                            )
                            .collect(Collectors.toList())
            );

            participants.addAll(
                    IntStream.range(0, witnesses.size())
                            .mapToObj(i ->
                                    buildParticipant(
                                            witnesses.get(i),
                                            savedComplaint,
                                            dto.getWitnessParticipants().get(i),
                                            ParticipantRole.WITNESS,
                                            dto.getCreatedBy()
                                    )
                            )
                            .collect(Collectors.toList())
            );

            List<ComplaintParticipant> savedParticipants = participants
                    .stream()
                    .map(participantRepo::save)
                    .collect(Collectors.toList());

            savedComplaint.setParticipants(savedParticipants);
            WrittenComplaint finalComplaint = complaintRepo.save(savedComplaint);
            
            // Log to audit service
            try {
                AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                        .tableName("written_complaint")
                        .recordId(Long.parseLong(finalComplaint.getComplaintId().replaceAll("[^0-9]", "")))
                        .action(ActionType.CREATED)
                        .changedBy(finalComplaint.getCreatedBy() != null ? finalComplaint.getCreatedBy().longValue() : 1L)
                        .afterState(objectMapper.writeValueAsString(finalComplaint))
                        .remarks("Registered new complaint statement")
                        .build();
                
                auditClient.createAuditTrail(auditRequest);
                logger.info("Audit trail logged for complaint ID: {}", finalComplaint.getComplaintId());
            } catch (Exception e) {
                logger.error("Failed to log audit trail for complaint: {}", e.getMessage());
                // Don't fail the operation if audit logging fails
            }
            
            logger.info("✅ Successfully registered complaint with ID: {}", finalComplaint.getComplaintId());
            return finalComplaint;
        } catch (Exception e) {
            throw ComplaintExceptionFactory.create(
                    "OFSCFS009",
                    "Failed to register statement: " + e.getMessage()
            );
        }
    }

    @Transactional
    public WrittenComplaint updateStatement(
            String complaintId,
            ComplaintRequestDTO dto,
            MultipartFile[] complainantFiles,
            MultipartFile[] offenderFiles,
            MultipartFile[] witnessFiles
    ) throws FileProcessingException {
        // First validate the DTOs for duplicates before processing citizens
        validateNoDuplicateDTOs(
                dto.getParticipants(),
                dto.getOffenderParticipants(),
                dto.getWitnessParticipants()
        );

        // Get the existing complaint or throw if not found
        WrittenComplaint existingComplaint = complaintRepo
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with ID: " + complaintId
                        )
                );

        // Capture before state for audit - MUST be done before any modifications
        // Force load of lazy collections before serialization
        existingComplaint.getParticipants().size(); // Force initialization
        
        String beforeState = null;
        try {
            beforeState = objectMapper.writeValueAsString(existingComplaint);
            logger.info("✅ Captured before state for complaint ID: {} (length: {} chars)", 
                complaintId, beforeState.length());
        } catch (Exception e) {
            logger.error("❌ Failed to serialize before state for complaint ID: {}", complaintId, e);
            logger.error("Error details: {}", e.getMessage());
        }

        try {
            // Process and validate citizens
            Integer updatedBy = dto.getUpdatedBy() != null
                    ? dto.getUpdatedBy()
                    : dto.getCreatedBy();

            // Save complainants with their files
            List<Citizen> complainants = saveComplainantCitizens(
                    dto.getParticipants(),
                    updatedBy,
                    complainantFiles
            );

            // Save accused with their files
            List<Citizen> accused = saveCitizens(
                    dto.getOffenderParticipants(),
                    ParticipantRole.OFFENDER,
                    updatedBy,
                    offenderFiles
            );

            // Save witnesses with their files
            List<Citizen> witnesses = saveCitizens(
                    dto.getWitnessParticipants(),
                    ParticipantRole.WITNESS,
                    updatedBy,
                    witnessFiles
            );

            // Validate for duplicate citizens and role overlaps
            validateNoDuplicateCitizens(complainants, accused, witnesses);

            // Get existing participants and clear the collection
            List<ComplaintParticipant> existingParticipants = new ArrayList<>(
                    existingComplaint.getParticipants()
            );
            existingComplaint.getParticipants().clear();

            // Process complainants (including co-complainants)
            List<ComplaintParticipant> newParticipants = IntStream.range(
                            0,
                            complainants.size()
                    )
                    .mapToObj(i -> {
                        Citizen citizen = complainants.get(i);
                        ComplaintParticipantDTO participantDto = dto
                                .getParticipants()
                                .get(i);

                        // Check if this citizen is already a participant in this complaint
                        boolean isNewParticipant = existingParticipants
                                .stream()
                                .noneMatch(p ->
                                        p
                                                .getCitizen()
                                                .getCitizenId()
                                                .equals(citizen.getCitizenId())
                                );

                        if (isNewParticipant) {
                            // For new participants, create a new participant record
                            return buildParticipant(
                                    citizen,
                                    existingComplaint,
                                    participantDto,
                                    i == 0
                                            ? ParticipantRole.COMPLAINANT
                                            : ParticipantRole.CO_COMPLAINANT,
                                    updatedBy
                            );
                        } else {
                            // For existing participants, update their information
                            return existingParticipants
                                    .stream()
                                    .filter(p ->
                                            p
                                                    .getCitizen()
                                                    .getCitizenId()
                                                    .equals(citizen.getCitizenId())
                                    )
                                    .findFirst()
                                    .map(p -> {
                                        // Update the existing participant
                                        p.setRole(
                                                i == 0
                                                        ? ParticipantRole.COMPLAINANT
                                                        : ParticipantRole.CO_COMPLAINANT
                                        );
                                        p.setUpdatedBy(updatedBy);
                                        p.setUpdatedOn(LocalDateTime.now());
                                        return p;
                                    })
                                    .orElse(null);
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(ArrayList::new));

            // Process accused/offenders
            if (accused != null) {
                List<ComplaintParticipant> accusedParticipants =
                        IntStream.range(0, accused.size())
                                .mapToObj(i -> {
                                    Citizen citizen = accused.get(i);
                                    ComplaintParticipantDTO participantDto = dto
                                            .getOffenderParticipants()
                                            .get(i);

                                    // Check if this offender is already a participant in this complaint
                                    boolean isNewParticipant = existingParticipants
                                            .stream()
                                            .noneMatch(p ->
                                                    p
                                                            .getCitizen()
                                                            .getCitizenId()
                                                            .equals(citizen.getCitizenId())
                                            );

                                    if (isNewParticipant) {
                                        // For new offenders, create a new participant record
                                        return buildParticipant(
                                                citizen,
                                                existingComplaint,
                                                participantDto,
                                                ParticipantRole.OFFENDER,
                                                updatedBy
                                        );
                                    } else {
                                        // For existing participants, update their role to offender
                                        return existingParticipants
                                                .stream()
                                                .filter(p ->
                                                        p
                                                                .getCitizen()
                                                                .getCitizenId()
                                                                .equals(citizen.getCitizenId())
                                                )
                                                .findFirst()
                                                .map(p -> {
                                                    p.setRole(ParticipantRole.OFFENDER);
                                                    p.setUpdatedBy(updatedBy);
                                                    p.setUpdatedOn(LocalDateTime.now());
                                                    return p;
                                                })
                                                .orElse(null);
                                    }
                                })
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                newParticipants.addAll(accusedParticipants);
            }

            // Process witnesses
            if (witnesses != null) {
                List<ComplaintParticipant> witnessParticipants =
                        IntStream.range(0, witnesses.size())
                                .mapToObj(i -> {
                                    Citizen citizen = witnesses.get(i);
                                    ComplaintParticipantDTO participantDto = dto
                                            .getWitnessParticipants()
                                            .get(i);

                                    // Check if this witness is already a participant in this complaint
                                    boolean isNewParticipant = existingParticipants
                                            .stream()
                                            .noneMatch(p ->
                                                    p
                                                            .getCitizen()
                                                            .getCitizenId()
                                                            .equals(citizen.getCitizenId())
                                            );

                                    if (isNewParticipant) {
                                        // For new witnesses, create a new participant record
                                        return buildParticipant(
                                                citizen,
                                                existingComplaint,
                                                participantDto,
                                                ParticipantRole.WITNESS,
                                                updatedBy
                                        );
                                    } else {
                                        // For existing participants, update their role to witness
                                        return existingParticipants
                                                .stream()
                                                .filter(p ->
                                                        p
                                                                .getCitizen()
                                                                .getCitizenId()
                                                                .equals(citizen.getCitizenId())
                                                )
                                                .findFirst()
                                                .map(p -> {
                                                    p.setRole(ParticipantRole.WITNESS);
                                                    p.setUpdatedBy(updatedBy);
                                                    p.setUpdatedOn(LocalDateTime.now());
                                                    return p;
                                                })
                                                .orElse(null);
                                    }
                                })
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                newParticipants.addAll(witnessParticipants);
            }

            // Update core complaint fields from DTO
            if (dto.getSubject() != null) {
                existingComplaint.setSubject(dto.getSubject());
            }
            if (dto.getDescription() != null) {
                existingComplaint.setDescription(dto.getDescription());
            }
            if (dto.getCrimeAddress() != null) {
                existingComplaint.setCrimeAddress(dto.getCrimeAddress());
            }
            if (dto.getCrimeDateTime() != null) {
                existingComplaint.setCrimeDateTime(dto.getCrimeDateTime());
            }
            if (dto.getFiledByStationId() != null) {
                existingComplaint.setFiledByStationId(dto.getFiledByStationId());
            }
            if (dto.getStatus() != null) {
                existingComplaint.setStatus(dto.getStatus());
            }
            
            // Set the updated participants and save the complaint
            existingComplaint.setParticipants(newParticipants);
            existingComplaint.setUpdatedBy(updatedBy);
            existingComplaint.setUpdatedOn(LocalDateTime.now());

            WrittenComplaint updatedComplaint = complaintRepo.save(existingComplaint);
            logger.info("✅ Saved updated complaint with ID: {}", updatedComplaint.getComplaintId());
            
            // Log to audit service
            try {
                // Force load participants before serialization
                updatedComplaint.getParticipants().size();
                
                String afterState = objectMapper.writeValueAsString(updatedComplaint);
                logger.info("✅ Captured after state for complaint ID: {} (length: {} chars)", 
                    updatedComplaint.getComplaintId(), afterState.length());
                
                AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                        .tableName("written_complaint")
                        .recordId(Long.parseLong(updatedComplaint.getComplaintId().replaceAll("[^0-9]", "")))
                        .action(ActionType.UPDATED)
                        .changedBy(updatedBy != null ? updatedBy.longValue() : 1L)
                        .beforeState(beforeState)
                        .afterState(afterState)
                        .remarks("Updated complaint statement")
                        .build();
                
                logger.info("========================================");
                logger.info("📤 SENDING AUDIT TRAIL TO AUDIT SERVICE");
                logger.info("========================================");
                logger.info("Complaint ID: {}", updatedComplaint.getComplaintId());
                logger.info("Table: {}", auditRequest.getTableName());
                logger.info("Record ID: {}", auditRequest.getRecordId());
                logger.info("Action: {}", auditRequest.getAction());
                logger.info("Changed By: {}", auditRequest.getChangedBy());
                logger.info("Before State length: {} chars", beforeState != null ? beforeState.length() : 0);
                logger.info("After State length: {} chars", afterState != null ? afterState.length() : 0);
                logger.info("Remarks: {}", auditRequest.getRemarks());
                logger.info("Audit Service URL: ${audit.service.url}");
                logger.info("========================================");
                
                var response = auditClient.createAuditTrail(auditRequest);
                
                logger.info("========================================");
                logger.info("✅ AUDIT TRAIL RESPONSE RECEIVED");
                logger.info("========================================");
                logger.info("Status Code: {}", response.getStatusCode());
                logger.info("Response Body: {}", response.getBody());
                logger.info("========================================");
            } catch (feign.FeignException e) {
                logger.error("========================================");
                logger.error("❌ FEIGN EXCEPTION - AUDIT SERVICE CALL FAILED");
                logger.error("========================================");
                logger.error("Complaint ID: {}", updatedComplaint.getComplaintId());
                logger.error("Error Status: {}", e.status());
                logger.error("Error Message: {}", e.getMessage());
                logger.error("Response Body: {}", e.contentUTF8());
                logger.error("========================================", e);
            } catch (Exception e) {
                logger.error("========================================");
                logger.error("❌ UNEXPECTED ERROR - AUDIT LOGGING FAILED");
                logger.error("========================================");
                logger.error("Complaint ID: {}", updatedComplaint.getComplaintId());
                logger.error("Error Type: {}", e.getClass().getName());
                logger.error("Error Message: {}", e.getMessage());
                if (e.getCause() != null) {
                    logger.error("Cause: {}", e.getCause().getMessage());
                }
                logger.error("========================================", e);
            }
            
            return updatedComplaint;
        } catch (ComplaintServiceException e) {
            // Re-throw known exceptions
            throw e;
        } catch (Exception e) {
            // Wrap other exceptions in a service exception
            throw ComplaintExceptionFactory.create(
                    "OFSCFS009",
                    "Failed to update statement: " + e.getMessage()
            );
        }
    }

    private List<Citizen> saveCitizens(
            List<ComplaintParticipantDTO> dtos,
            ParticipantRole role,
            Integer createdBy,
            MultipartFile[] files
    ) throws FileProcessingException {
        return Optional.ofNullable(dtos)
                .filter(list -> !list.isEmpty())
                .map(list ->
                        IntStream.range(0, list.size())
                                .mapToObj(i ->
                                        processCitizenForIndex(list.get(i), createdBy, files, i)
                                )
                                .collect(Collectors.toList())
                )
                .orElse(new ArrayList<>());
    }

    private List<Citizen> saveComplainantCitizens(
            List<ComplaintParticipantDTO> dtos,
            Integer createdBy,
            MultipartFile[] files
    ) throws FileProcessingException {
        return Optional.ofNullable(dtos)
                .filter(list -> !list.isEmpty())
                .map(list ->
                        IntStream.range(0, list.size())
                                .mapToObj(i ->
                                        processCitizenForIndex(list.get(i), createdBy, files, i)
                                )
                                .collect(Collectors.toList())
                )
                .orElse(new ArrayList<>());
    }

    private Citizen processCitizenForIndex(
            ComplaintParticipantDTO dto,
            Integer createdBy,
            MultipartFile[] files,
            int index
    ) {
        Citizen existingCitizen = findExistingCitizen(dto).orElseGet(() -> {
            validateUniqueness(dto);
            return null;
        });

        Citizen citizen = Optional.ofNullable(existingCitizen)
                .map(existing -> updateExistingCitizen(existing, dto))
                .orElseGet(() -> createNewCitizen(dto, createdBy));

        // Save citizen first to get the ID (required for document upload)
        Citizen savedCitizen = citizenRepo.save(citizen);

        logger.debug(
                "Citizen saved with ID: {}, name: {}, totalFiles: {}",
                savedCitizen.getCitizenId(),
                savedCitizen.getName(),
                (files != null ? files.length : 0)
        );

        // Process ALL files for this citizen (not just one at index)
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    try {
                        processCitizenFile(savedCitizen, file);
                    } catch (IOException e) {
                        logger.error(
                                "Failed to process file for citizen {}: {}",
                                savedCitizen.getCitizenId(),
                                e.getMessage()
                        );
                    }
                }
            }
        }

        // Save again to persist document paths set by processCitizenFile
        return citizenRepo.save(savedCitizen);
    }

    private Citizen updateExistingCitizen(
            Citizen existingCitizen,
            ComplaintParticipantDTO dto
    ) {
        Optional.ofNullable(dto.getName())
                .filter(name -> !name.trim().isEmpty())
                .ifPresent(existingCitizen::setName);
        Optional.ofNullable(dto.getEmail())
                .filter(email -> !email.trim().isEmpty())
                .ifPresent(existingCitizen::setEmail);
        Optional.ofNullable(dto.getContactNo())
                .filter(contact -> !contact.trim().isEmpty())
                .ifPresent(existingCitizen::setContactNo);
        Optional.ofNullable(dto.getAadharNo())
                .filter(aadhar -> !aadhar.trim().isEmpty())
                .ifPresent(existingCitizen::setAadharNo);
        Optional.ofNullable(dto.getGender())
                .filter(gender -> !gender.trim().isEmpty())
                .ifPresent(existingCitizen::setGender);
        Optional.ofNullable(dto.getProfession())
                .filter(profession -> !profession.trim().isEmpty())
                .ifPresent(existingCitizen::setProfession);
        Optional.ofNullable(dto.getAge())
                .filter(age -> age > 0)
                .ifPresent(existingCitizen::setAge);
        return existingCitizen;
    }

    private Citizen createNewCitizen(
            ComplaintParticipantDTO dto,
            Integer createdBy
    ) {
        Citizen citizen = mapper.mapToCitizen(dto);
        citizen.setCreatedBy(createdBy);
        citizen.setCreatedOn(LocalDateTime.now());
        return citizen;
    }

    private ComplaintParticipant buildParticipant(
            Citizen citizen,
            WrittenComplaint complaint,
            ComplaintParticipantDTO dto,
            ParticipantRole role,
            Integer createdBy
    ) {
        return ComplaintParticipant.builder()
                .citizen(citizen)
                .complaint(complaint)
                .role(role)
                // Persist any participant statement (used for witnesses)
                .statement(dto.getStatement())
                .createdBy(createdBy)
                .createdOn(LocalDateTime.now())
                .updatedBy(dto.getUpdatedBy())
                .updatedOn(dto.getUpdatedOn())
                .build();
    }

    private Optional<Citizen> findExistingCitizen(ComplaintParticipantDTO dto) {
        return Stream.of(
                        Optional.ofNullable(dto.getAadharNo()).flatMap(
                                citizenRepo::findByAadharNo
                        ),
                        Optional.ofNullable(dto.getEmail()).map(email -> {
                            List<Citizen> citizens = citizenRepo.findAllByEmail(email);
                            return citizens.isEmpty() ? null : citizens.get(0);
                        }),
                        Optional.ofNullable(dto.getContactNo()).flatMap(
                                citizenRepo::findByContactNo
                        )
                )
                .flatMap(Optional::stream)
                .findFirst();
    }

    private void validateNoDuplicateDTOs(
            List<ComplaintParticipantDTO> complainants,
            List<ComplaintParticipantDTO> accused,
            List<ComplaintParticipantDTO> witnesses
    ) {
        // Check for actual duplicates with identifying information, not just empty DTOs
        Stream.of(
                        Optional.ofNullable(complainants)
                                .stream()
                                .flatMap(Collection::stream),
                        Optional.ofNullable(accused).stream().flatMap(Collection::stream),
                        Optional.ofNullable(witnesses).stream().flatMap(Collection::stream)
                )
                .flatMap(stream -> stream)
                // Only consider DTOs that have at least some identifying information
                .filter(dto -> hasIdentifyingInfo(dto))
                .collect(
                        Collectors.groupingBy(
                                this::createDTOIdentifier,
                                Collectors.counting()
                        )
                )
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() > 1)
                .forEach(entry -> {
                    String role = Stream.of(
                                    Optional.ofNullable(complainants).map(list ->
                                            list
                                                    .stream()
                                                    .anyMatch(
                                                            dto ->
                                                                    createDTOIdentifier(dto).equals(
                                                                            entry.getKey()
                                                                    ) &&
                                                                            hasIdentifyingInfo(dto)
                                                    )
                                                    ? "complainant"
                                                    : null
                                    ),
                                    Optional.ofNullable(accused).map(list ->
                                            list
                                                    .stream()
                                                    .anyMatch(
                                                            dto ->
                                                                    createDTOIdentifier(dto).equals(
                                                                            entry.getKey()
                                                                    ) &&
                                                                            hasIdentifyingInfo(dto)
                                                    )
                                                    ? "accused"
                                                    : null
                                    ),
                                    Optional.ofNullable(witnesses).map(list ->
                                            list
                                                    .stream()
                                                    .anyMatch(
                                                            dto ->
                                                                    createDTOIdentifier(dto).equals(
                                                                            entry.getKey()
                                                                    ) &&
                                                                            hasIdentifyingInfo(dto)
                                                    )
                                                    ? "witness"
                                                    : null
                                    )
                            )
                            .flatMap(Optional::stream)
                            .findFirst()
                            .orElse("participant");
                    throw ComplaintExceptionFactory.create(
                            "OFSCFS009",
                            "Duplicate " + role + " data found in request"
                    );
                });
    }

    private boolean hasIdentifyingInfo(ComplaintParticipantDTO dto) {
        return (
                (dto.getAadharNo() != null &&
                        !dto.getAadharNo().trim().isEmpty()) ||
                        (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) ||
                        (dto.getContactNo() != null &&
                                !dto.getContactNo().trim().isEmpty()) ||
                        (dto.getName() != null && !dto.getName().trim().isEmpty())
        );
    }

    private String createDTOIdentifier(ComplaintParticipantDTO dto) {
        // Create a more robust identifier that includes name for better distinction
        return String.format(
                "%s|%s|%s|%s",
                Optional.ofNullable(dto.getAadharNo()).orElse(""),
                Optional.ofNullable(dto.getEmail()).orElse(""),
                Optional.ofNullable(dto.getContactNo()).orElse(""),
                Optional.ofNullable(dto.getName()).orElse("")
        );
    }

    private void validateNoDuplicateCitizens(
            List<Citizen> complainants,
            List<Citizen> accused,
            List<Citizen> witnesses
    ) {
        // Check for duplicates within complainants
        if (complainants != null) {
            Set<Integer> complainantIds = new HashSet<>();
            for (Citizen citizen : complainants) {
                if (citizen.getCitizenId() != null) {
                    if (!complainantIds.add(citizen.getCitizenId())) {
                        throw ComplaintExceptionFactory.create(
                                "OFSCFS009",
                                String.format(
                                        "Duplicate complainant found with ID: %d - %s",
                                        citizen.getCitizenId(),
                                        citizen.getName() != null
                                                ? citizen.getName()
                                                : ""
                                )
                        );
                    }
                }
            }
        }

        // Check for duplicates within accused
        if (accused != null) {
            Set<Integer> accusedIds = new HashSet<>();
            for (Citizen citizen : accused) {
                if (citizen.getCitizenId() != null) {
                    if (!accusedIds.add(citizen.getCitizenId())) {
                        throw ComplaintExceptionFactory.create(
                                "OFSCFS009",
                                String.format(
                                        "Duplicate accused found with ID: %d - %s",
                                        citizen.getCitizenId(),
                                        citizen.getName() != null
                                                ? citizen.getName()
                                                : ""
                                )
                        );
                    }
                }
            }
        }

        // Check for duplicates within witnesses
        if (witnesses != null) {
            Set<Integer> witnessIds = new HashSet<>();
            for (Citizen citizen : witnesses) {
                if (citizen.getCitizenId() != null) {
                    if (!witnessIds.add(citizen.getCitizenId())) {
                        throw ComplaintExceptionFactory.create(
                                "OFSCFS009",
                                String.format(
                                        "Duplicate witness found with ID: %d - %s",
                                        citizen.getCitizenId(),
                                        citizen.getName() != null
                                                ? citizen.getName()
                                                : ""
                                )
                        );
                    }
                }
            }
        }

        // Get all citizen IDs for role overlap checking
        Set<Integer> complainantIds = complainants != null
                ? complainants
                .stream()
                .map(Citizen::getCitizenId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet())
                : Collections.emptySet();

        Set<Integer> accusedIds = accused != null
                ? accused
                .stream()
                .map(Citizen::getCitizenId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet())
                : Collections.emptySet();

        Set<Integer> witnessIds = witnesses != null
                ? witnesses
                .stream()
                .map(Citizen::getCitizenId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet())
                : Collections.emptySet();

        // Check for role overlaps
        Set<Integer> complainantAccusedOverlap = new HashSet<>(complainantIds);
        complainantAccusedOverlap.retainAll(accusedIds);
        if (!complainantAccusedOverlap.isEmpty()) {
            throw ComplaintExceptionFactory.create(
                    "OFSCFS009",
                    "The same person cannot be both complainant and accused in the same complaint"
            );
        }

        Set<Integer> complainantWitnessOverlap = new HashSet<>(complainantIds);
        complainantWitnessOverlap.retainAll(witnessIds);
        if (!complainantWitnessOverlap.isEmpty()) {
            throw ComplaintExceptionFactory.create(
                    "OFSCFS009",
                    "The same person cannot be both complainant and witness in the same complaint"
            );
        }

        Set<Integer> accusedWitnessOverlap = new HashSet<>(accusedIds);
        accusedWitnessOverlap.retainAll(witnessIds);
        if (!accusedWitnessOverlap.isEmpty()) {
            throw ComplaintExceptionFactory.create(
                    "OFSCFS009",
                    "The same person cannot be both accused and witness in the same complaint"
            );
        }
    }

    private void validateUniqueness(ComplaintParticipantDTO dto) {
        List<String> errors = Stream.of(
                        Optional.ofNullable(dto.getAadharNo())
                                .filter(aadhar -> citizenRepo.existsByAadharNo(aadhar))
                                .map(aadhar -> "Aadhar Number already exists"),
                        Optional.ofNullable(dto.getEmail())
                                .filter(email -> !citizenRepo.findAllByEmail(email).isEmpty())
                                .map(email -> "Email already exists"),
                        Optional.ofNullable(dto.getContactNo())
                                .filter(contact -> citizenRepo.existsByContactNo(contact))
                                .map(contact -> "Contact Number already exists")
                )
                .flatMap(Optional::stream)
                .collect(Collectors.toList());

        if (!errors.isEmpty()) {
            throw new RuntimeException(String.join("; ", errors));
        }
    }

    private boolean hasValidFile(MultipartFile[] files, int index) {
        return (
                files != null &&
                        index < files.length &&
                        files[index] != null &&
                        !files[index].isEmpty()
        );
    }
}
