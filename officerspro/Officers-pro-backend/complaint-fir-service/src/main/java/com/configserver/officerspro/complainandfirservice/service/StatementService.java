package com.configserver.officerspro.complainandfirservice.service;

import com.configserver.officerspro.complainandfirservice.client.DocumentServiceClient;
import com.configserver.officerspro.complainandfirservice.dto.ComplaintResponseDTO;
import com.configserver.officerspro.complainandfirservice.dto.FIRRequestDTO;
import com.configserver.officerspro.complainandfirservice.entity.FIR;
import com.configserver.officerspro.complainandfirservice.entity.FIRAccused;
import com.configserver.officerspro.complainandfirservice.entity.FIRVictim;
import com.configserver.officerspro.complainandfirservice.entity.FIRWitness;
import com.configserver.officerspro.complainandfirservice.entity.WrittenComplaint;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import com.configserver.officerspro.complainandfirservice.enums.FIRStatus;
import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import com.configserver.officerspro.complainandfirservice.repository.FIRAccusedRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRVictimRepository;
import com.configserver.officerspro.complainandfirservice.repository.FIRWitnessRepository;
import com.configserver.officerspro.complainandfirservice.repository.WrittenComplaintRepository;
import com.configserver.officerspro.complainandfirservice.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatementService {

    private static final Logger logger = LoggerFactory.getLogger(
        StatementService.class
    );

    private final WrittenComplaintRepository complaintRepository;
    private final FIRRepository firRepository;
    private final FIRVictimRepository firVictimRepository;
    private final FIRAccusedRepository firAccusedRepository;
    private final FIRWitnessRepository firWitnessRepository;
    private final DocumentServiceClient documentServiceClient;
    private final CodeGenerator codeGenerator;

    public Page<ComplaintResponseDTO> getAllStatements(
        ComplaintStatus status,
        Integer createdBy,
        Integer stationId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    ) {
        return complaintRepository
            .findAllWithFilters(
                status,
                createdBy,
                stationId,
                startDate,
                endDate,
                pageable
            )
            .map(this::mapToResponseDTO);
    }

    public boolean hasFIR(String complaintId) {
        return firRepository.existsByComplaint_ComplaintId(complaintId);
    }

    public FIR getFIRByComplaintId(String complaintId) {
        return firRepository.findFirstByComplaint_ComplaintId(complaintId);
    }

    @Transactional
    public FIR registerFIRWithSections(
        String complaintId,
        FIRRequestDTO firData,
        MultipartFile firFile
    ) throws IOException {
        logger.info("🔍 Starting FIR registration for complaint: {}", complaintId);
        logger.info("🔍 FIR Data: sections={}, description={}, officerId={}", 
            firData.getSections(), firData.getDescription(), firData.getOfficerId());
        
        WrittenComplaint complaint = complaintRepository
            .findById(complaintId)
            .orElseThrow(() -> {
                logger.error("❌ Complaint not found: {}", complaintId);
                return new RuntimeException("Complaint not found: " + complaintId);
            });
        
        logger.info("✅ Found complaint: {}", complaint.getComplaintId());

        // Generate string-based FIR ID
        String firId = codeGenerator.generateNextFirId();
        logger.info("✅ Generated FIR ID: {}", firId);

        FIR fir = FIR.builder()
            .firId(firId)
            .complaint(complaint)
            .sections(firData.getSections())
            .description(firData.getDescription())
            .status(FIRStatus.OPEN)
            .registeredOn(LocalDateTime.now())
            .officerId(firData.getOfficerId())
            .createdBy(firData.getOfficerId())
            .createdOn(LocalDateTime.now())
            .build();
        
        logger.info("🔍 FIR object built, attempting to save...");

        // Save FIR first to ensure it's persisted
        FIR savedFIR;
        try {
            savedFIR = firRepository.save(fir);
            firRepository.flush(); // Force immediate write to database
            logger.info("✅ FIR saved to database with ID: {}", savedFIR.getFirId());
            
            // Verify FIR was saved
            boolean exists = firRepository.existsById(savedFIR.getFirId());
            logger.info("🔍 FIR exists check: {}", exists);
            if (!exists) {
                logger.error("❌ WARNING: FIR was not found in database after save!");
                throw new RuntimeException("FIR was not persisted to database");
            }
        } catch (Exception e) {
            logger.error("❌ Failed to save FIR: {}", e.getMessage(), e);
            throw e;
        }

        // Handle document upload (non-critical, shouldn't rollback FIR save)
        if (firFile != null && !firFile.isEmpty()) {
            try {
                logger.info(
                    "Uploading FIR document: firId={}, fileName={}",
                    savedFIR.getFirId(),
                    firFile.getOriginalFilename()
                );

                // Upload to document service
                Map<String, Object> response =
                    documentServiceClient.uploadDocument(
                        firFile,
                        "FIR",
                        savedFIR.getFirId(),
                        "FIR_DOCUMENT",
                        firData.getOfficerId().toString()
                    );

                // Extract document ID from response
                Integer documentId = extractDocumentId(response);
                if (documentId != null) {
                    String documentPath = "/documents/" + documentId;
                    savedFIR.setFirDocumentPath(documentPath);
                    savedFIR = firRepository.save(savedFIR);
                    logger.info(
                        "FIR document uploaded successfully: documentId={}, path={}",
                        documentId,
                        documentPath
                    );
                } else {
                    logger.warn(
                        "Failed to extract documentId from response: {}. Falling back to local storage.",
                        response
                    );
                    String filePath = saveFIRFile(firFile);
                    savedFIR.setFirDocumentPath(filePath);
                    savedFIR = firRepository.save(savedFIR);
                }
            } catch (Exception e) {
                logger.error(
                    "Failed to upload FIR document to document service, falling back to local storage: {}",
                    e.getMessage(),
                    e
                );
                // Fallback to local storage if document service is unavailable
                try {
                    String filePath = saveFIRFile(firFile);
                    savedFIR.setFirDocumentPath(filePath);
                    savedFIR = firRepository.save(savedFIR);
                    logger.info("FIR document saved to local storage: {}", filePath);
                } catch (Exception localStorageException) {
                    logger.error("Failed to save document to local storage: {}", localStorageException.getMessage());
                    // Continue without document - FIR is already saved
                }
            }
        }

        // Create related entities (victims, accused, witnesses)
        try {
            createFIRVictimsAndAccused(complaint, savedFIR);
            logger.info("✅ Created FIR victims, accused, and witnesses");
        } catch (Exception e) {
            logger.error("Failed to create FIR related entities: {}", e.getMessage(), e);
            // Don't fail the entire FIR registration if related entities fail
            // The FIR is already saved, related entities can be added later
        }
        
        logger.info("✅ Successfully registered FIR with ID: {}", savedFIR.getFirId());

        return savedFIR;
    }

    private void createFIRVictimsAndAccused(
        WrittenComplaint complaint,
        FIR fir
    ) {
        // Create FIRVictim entries for complainants
        complaint
            .getParticipants()
            .stream()
            .filter(
                participant ->
                    participant.getRole() == ParticipantRole.COMPLAINANT ||
                    participant.getRole() == ParticipantRole.CO_COMPLAINANT
            )
            .forEach(participant -> {
                FIRVictim victim = FIRVictim.builder()
                    .fir(fir)
                    .citizen(participant.getCitizen())
                    .build();
                firVictimRepository.save(victim);
            });

        // Create FIRAccused entries for offenders
        complaint
            .getParticipants()
            .stream()
            .filter(
                participant -> participant.getRole() == ParticipantRole.OFFENDER
            )
            .forEach(participant -> {
                FIRAccused accused = FIRAccused.builder()
                    .fir(fir)
                    .citizen(participant.getCitizen())
                    .build();
                firAccusedRepository.save(accused);
            });

        // Create FIRWitness entries for witnesses
        complaint
            .getParticipants()
            .stream()
            .filter(
                participant -> participant.getRole() == ParticipantRole.WITNESS
            )
            .forEach(participant -> {
                FIRWitness witness = FIRWitness.builder()
                    .fir(fir)
                    .citizen(participant.getCitizen())
                    .remarks("") // Can be populated later if needed
                    .createdBy(fir.getCreatedBy())
                    .createdOn(LocalDateTime.now())
                    .build();
                firWitnessRepository.save(witness);
                System.out.println(
                    "✅ Saved witness to FIRWitness: " +
                        participant.getCitizen().getName()
                );
            });
    }

    private String saveFIRFile(MultipartFile file) throws IOException {
        String uploadDir = "uploads/fir/";
        java.nio.file.Path dirPath = java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(dirPath)) {
            java.nio.file.Files.createDirectories(dirPath);
        }

        String fileName =
            "FIR_" +
            System.currentTimeMillis() +
            "_" +
            file.getOriginalFilename();
        java.nio.file.Path filePath = dirPath.resolve(fileName);

        byte[] fileData = file.getBytes();
        java.nio.file.Files.write(filePath, fileData);

        return "/fir/" + fileName;
    }

    private Integer extractDocumentId(Map<String, Object> response) {
        if (response == null) {
            logger.error("Document service response is null");
            return null;
        }
        Object docId = response.get("documentId");
        if (docId instanceof Integer) {
            return (Integer) docId;
        } else if (docId instanceof Number) {
            return ((Number) docId).intValue();
        }
        logger.error(
            "Document ID not found or invalid in response: {}",
            response
        );
        return null;
    }

    public ComplaintResponseDTO mapToResponseDTO(WrittenComplaint complaint) {
        ComplaintResponseDTO dto = new ComplaintResponseDTO();
        dto.setComplaintId(complaint.getComplaintId());
        dto.setFiledByStationId(complaint.getFiledByStationId());
        dto.setFiledDate(complaint.getFiledDate());
        dto.setSubject(complaint.getSubject());
        dto.setDescription(complaint.getDescription());
        dto.setCrimeAddress(complaint.getCrimeAddress());
        dto.setCrimeDateTime(complaint.getCrimeDateTime());
        dto.setStatus(complaint.getStatus());
        dto.setCreatedBy(complaint.getCreatedBy());
        dto.setCreatedOn(complaint.getCreatedOn());
        dto.setUpdatedBy(complaint.getUpdatedBy());
        dto.setUpdatedOn(complaint.getUpdatedOn());

        FIR fir = firRepository.findFirstByComplaint_ComplaintId(
            complaint.getComplaintId()
        );
        if (fir != null) {
            dto.setHasFIR(true);
            dto.setFirNo(fir.getFirId()); // Now using the string-based FIR ID
            dto.setFirRegisteredDate(fir.getRegisteredOn());
        } else {
            dto.setHasFIR(false);
        }

        // Group participants by role and extract names
        Map<ParticipantRole, List<String>> participantsByRole = complaint
            .getParticipants()
            .stream()
            .collect(
                Collectors.groupingBy(
                    participant -> participant.getRole(),
                    Collectors.mapping(
                        participant -> participant.getCitizen().getName(),
                        Collectors.toList()
                    )
                )
            );

        // Set victim names (complainants)
        List<String> victimNames = participantsByRole.getOrDefault(
            ParticipantRole.COMPLAINANT,
            List.of()
        );
        victimNames.addAll(
            participantsByRole.getOrDefault(
                ParticipantRole.CO_COMPLAINANT,
                List.of()
            )
        );
        dto.setVictimNames(victimNames);

        // Set offender names
        dto.setOffenderNames(
            participantsByRole.getOrDefault(ParticipantRole.OFFENDER, List.of())
        );

        // Set full participants for editing
        dto.setParticipants(complaint.getParticipants());

        return dto;
    }
}
