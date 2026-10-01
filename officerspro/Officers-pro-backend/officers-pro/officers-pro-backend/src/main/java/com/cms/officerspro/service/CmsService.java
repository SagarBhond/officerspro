package com.cms.officerspro.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.cms.officerspro.configuration.S3ClientConfig;
import com.cms.officerspro.constants.Constants;
import com.cms.officerspro.repository.*;
import com.cms.officerspro.dto.*;
import com.cms.officerspro.entity.*;
import com.cms.officerspro.mapper.EntityMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.beans.PropertyDescriptor;
import java.io.*;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
public class CmsService {

    @Autowired
    private VictimRepo victimRepo;

    @Autowired
    private CrimeDetailsRepo crimeDetailsRepo;

    @Autowired
    private OfficerRepo officerRepo;

    @Autowired
    private OffenderRepo offenderRepo;

    @Autowired
    private InvestigationDetailsRepo investigationDetailsRepo;

    @Autowired
    private FileEntityRepository fileEntityRepository;

    @Autowired
    private EvidenceRepo evidenceRepo;

    @Autowired
    private HelpAndSupportRepo helpAndSupportRepo;

    @Autowired
    private WitnessRepo witnessRepo;

    @Autowired
    private FeedbackRepository feedbackRepo;

    @Autowired
    private EntityMapper mapper;

    @Autowired
    private FerristRepo ferristRepo;

    @Autowired
    private S3ClientConfig s3ClientConfig;

    @Value("${cloud.aws.s3.bucket.name}")
    private String bucketName;

    @Autowired
    private KeycloakService keycloakService;

    @Transactional
    public OfficerDto crimeReport(String officerId, VictimDto victimDto, MultipartFile[] victimFiles, MultipartFile[] offenderFiles) {

        Officer savedOfficer = null;

        try {
            List<Victim> victimList = new ArrayList<>();

            List<Offender> offenderList = new ArrayList<>();
            CrimeDetailsDto crimeDetailsDto = victimDto.getCrimesDetails();
            CrimeDetails crimeDetails = mapper.mapToCrimeDetails(crimeDetailsDto);
            Victim victim = mapper.mapToVictim(victimDto);

            for (OffenderDto offenderDto : victimDto.getOffenderList()) {
                Offender offender = mapper.mapToOffender(offenderDto);

                if(offenderFiles!=null){
                    for (MultipartFile file : offenderFiles) {

                        if (file.isEmpty()) {
                            System.out.println("Received an empty file: " + file.getOriginalFilename());
                            continue;
                        }

                        if (isFileForOffender(file, offender)) {
                            try {
                                FileEntity fileEntity = new FileEntity();
                                fileEntity.setFileName(file.getOriginalFilename());
                                String filePath = saveFile(file, Constants.OFFENDER); // Save file and get file path
                                fileEntity.setFilePath(filePath);
                                fileEntity = fileEntityRepository.save(fileEntity); // Save file entity

                                assignFileToOffender(fileEntity, offender);
                            } catch (IOException e) {
                                System.err.println("Error processing file: " + e.getMessage());
                            }
                        }
                    }
                }else {
                    System.out.println("Received a null file.");
                }

                offenderList.add(offenderRepo.save(offender));

            }

            if(victimFiles!=null) {
                for (MultipartFile file : victimFiles) {
                    if (file.isEmpty()) {
                        System.out.println("Received an empty file: " + file.getOriginalFilename());
                        continue; // Skip empty files
                    }

                    if (isFileForVictim(file, victim)) {
                        try {
                            FileEntity fileEntity = new FileEntity();
                            fileEntity.setFileName(file.getOriginalFilename());
                            String filePath = saveFile(file,Constants.VICTIM);
                            fileEntity.setFilePath(filePath);
                            fileEntity = fileEntityRepository.save(fileEntity);
                            assignFileToVictim(fileEntity, victim);
                        } catch (IOException e) {
                            System.err.println("Error processing file: " + e.getMessage());
                        }
                    }
                }
            }else{
                System.out.println("Received a null file.");
            }

            CrimeDetails savedCrime = crimeDetailsRepo.save(crimeDetails);
            victim.setOffenderList(offenderList);
            victim.setCrimesDetails(savedCrime);

            victimList.add(victim);

            victimRepo.saveAll(victimList);

            savedOfficer=updateOrSaveOfficer(officerId, victimList);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return mapper.mapToOfficerDto(savedOfficer);
    }

    private boolean isFileForOffender(MultipartFile file, Offender offender) {
        return file.getOriginalFilename().contains(offender.getOffenderName());
    }

    private void assignFileToOffender(FileEntity fileEntity, Offender offender) {
        if (fileEntity.getFileName().contains("aadhar")) {
            offender.setAadharFile(fileEntity);
        } else if (fileEntity.getFileName().contains("pan")) {
            offender.setPanFile(fileEntity);
        } else if (fileEntity.getFileName().contains("passport")) {
            offender.setPassportFile(fileEntity);
        }
    }

    private boolean isFileForVictim(MultipartFile file, Victim victim) {
        return file.getOriginalFilename().contains(victim.getVictimName());
    }

    private void assignFileToVictim(FileEntity fileEntity, Victim victim) {
        if (fileEntity.getFileName().contains("aadhar")) {
            victim.setAadharFile(fileEntity);
        } else if (fileEntity.getFileName().contains("pan")) {
            victim.setPanFile(fileEntity);
        } else if (fileEntity.getFileName().contains("passport")) {
            victim.setPassportFile(fileEntity);
        }
    }

    private String saveFile(MultipartFile file,String type) throws IOException {
        if (!file.isEmpty()) {
            String newFilePath = type+ "/" +file.getOriginalFilename();

            AmazonS3 s3Client = s3ClientConfig.getS3Client();

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            s3Client.putObject(new PutObjectRequest(bucketName, newFilePath, file.getInputStream(), metadata));

            return newFilePath;
        }
        return null;
    }

    private void deleteFileFromS3(String filePath) {
        AmazonS3 s3Client = s3ClientConfig.getS3Client();

        s3Client.deleteObject(new DeleteObjectRequest(bucketName, filePath));
    }


    private Officer updateOrSaveOfficer(String officerId, List<Victim> victimList) {
        Officer savedOfficer = null;
        if (officerRepo.existsById(officerId)) {
            Officer officer = officerRepo.findById(officerId).get();
            officer.getVictimList().addAll(victimList);
            savedOfficer = officerRepo.save(officer);
        }
        return savedOfficer;
    }


    public OfficerDto getCrimeReport(String victimId) {
        Victim victim = victimRepo.findById(victimId).get();

        List<InvestigationDetails> investigationDetailsList = investigationDetailsRepo.findByVictimId(victimId);

        String officerId = victimRepo.findOfficerId(victimId);
        Officer officer = officerRepo.findById(officerId).get();

        List<Victim> victimList = new ArrayList<>();
        victimList.add(victim);
        officer.setVictimList(victimList);

        officer.setInvestigationDetailsList(investigationDetailsList);

        return mapper.mapToOfficerDto(officer);
    }

    @Transactional
    public boolean updateInvestigation(UpdateInvestigationDto updateInvestigationDto) {
        try {
            String victimId = updateInvestigationDto.getVictimId();
            String caseStatus = updateInvestigationDto.getCaseStatus();
            InvestigationDetails investigationDetails = updateInvestigationDto.getInvestigationDetails();

            Victim victim = victimRepo.findById(victimId).get();
            victim.setCaseStatus(caseStatus);

            List<Offender> offenders = updateInvestigationDto.getOffenderList();
            for (Offender offender : offenders) {
                Offender existingOffender = victim.getOffenderList().stream()
                        .filter(o -> o.getOffenderId().equals(offender.getOffenderId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Offender not found"));
                existingOffender.setArrestedStatus(offender.getArrestedStatus());
            }

            String officerId = victimRepo.findOfficerId(victimId);
            Officer officer = officerRepo.findById(officerId).get();

            List<InvestigationDetails> investigationDetailsList = investigationDetailsRepo.findByVictimId(victimId);
            investigationDetails.setVictim(victim);
            investigationDetailsList.add(investigationDetails);

            officer.getInvestigationDetailsList().add(investigationDetails);

            investigationDetailsRepo.saveAll(investigationDetailsList);
            Officer savedOfficer = officerRepo.save(officer);

            return true;
        } catch (Exception e) {
            System.out.println("Error : " + e.getMessage());
            return false;
        }
    }


    public boolean updateCrimeDetails(UpdateCrimeDetailsDto updateCrimeDetailsDto) {

        String crimeId = updateCrimeDetailsDto.getCrimeId();
        String updatedCrimeDescription = updateCrimeDetailsDto.getUpdatedCrimeDescription();
        System.out.println(crimeId);
        CrimeDetails crimeDetails = crimeDetailsRepo.findById(crimeId).get();
        System.out.println("crime desc in db before update : " + crimeDetails.getCrimeDescription());

        crimeDetails.setCrimeDescription(updatedCrimeDescription);

        CrimeDetails updatedCrimeDetails = crimeDetailsRepo.save(crimeDetails);
        System.out.println("crime desc in db after update : " + updatedCrimeDetails.getCrimeDescription());

        return updatedCrimeDetails != null;
    }

    public boolean updateInvestigationById(UpdateInvestigationByIdDto updateInvestigationByIdDto) {

        String investId = updateInvestigationByIdDto.getInvestId();
        String updatedInvestDesc = updateInvestigationByIdDto.getUpdatedInvestigationDescription();

        InvestigationDetails investigationDetails = investigationDetailsRepo.findById(investId).get();
        System.out.println("invest desc for id " + investId + " in db before update : " + investigationDetails.getInvestDescription());

        investigationDetails.setInvestDescription(updatedInvestDesc);

        InvestigationDetails updatedInvestigationDetails = investigationDetailsRepo.save(investigationDetails);
        System.out.println("invest desc for id " + investId + " in db after update : " + investigationDetails.getInvestDescription());

        return updatedInvestigationDetails != null;
    }

    public OfficerDto getOfficerDetails() {
        List<Officer> officerList = officerRepo.findAll();

        return mapper.mapToOfficerDto(officerList.get(0));
    }

    public List<OfficerListDto> getOfficerList() {
        List<Officer> allOfficers = officerRepo.findAll();

        List<OfficerListDto> officerListDtos = allOfficers.stream()
                .map(officer -> {
                    OfficerListDto dto = mapper.mapToOfficerListDto(officer);
                    dto.setPassword("");
                    return dto;
                })
                .toList();

        Map<String, String> officerCredentials = keycloakService.getOfficersCredentials(
                officerListDtos.stream()
                        .map(OfficerListDto::getOfficerEmail)
                        .collect(Collectors.toSet())
        );

        officerListDtos.forEach(officer ->
                officer.setPassword(officerCredentials.getOrDefault(officer.getOfficerEmail(), ""))
        );

        return officerListDtos;
    }


    public OfficerDto addOfficer(OfficerDto officerDto, MultipartFile[] files) throws IOException {
        Optional<Officer> optionalOfficer = officerRepo.findByOfficerEmail(officerDto.getOfficerEmail());

        if (optionalOfficer.isPresent()) {
            throw new RuntimeException("Officer email already registered.");
        }

        Officer officer = mapper.mapToOfficer(officerDto);

        if (officer.getSubscriptionType() != null) {
            LocalDateTime now = LocalDateTime.now();
            officer.setSubscriptionStartDate(now);

            switch (officer.getSubscriptionType()) {
                case FREE -> officer.setSubscriptionEndDate(null);
                case ONE_MONTH -> officer.setSubscriptionEndDate(now.plusMonths(1));
                case THREE_MONTHS -> officer.setSubscriptionEndDate(now.plusMonths(3));
                case SIX_MONTHS -> officer.setSubscriptionEndDate(now.plusMonths(6));
                case TWELVE_MONTHS -> officer.setSubscriptionEndDate(now.plusMonths(12));
                default -> log.error("Wrong or No Subscription Type selected");
            }
        }

        for (MultipartFile file : files) {
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFileName(file.getOriginalFilename());
            String filePath = saveFile(file,Constants.OFFICER);
            fileEntity.setFilePath(filePath);
            fileEntity = fileEntityRepository.save(fileEntity);
            assignFileToOfficer(fileEntity, officer);
        }

        officer.setOfficerStatus(true);

        KeycloakUserRegistrationRequest user = getKeycloakUserRegistrationRequest(officer);

        if (keycloakService.registerUserOnKeycloak(user)) {
            Officer savedOfficer = officerRepo.save(officer);
            return mapper.mapToOfficerDto(savedOfficer);
        } else {
            throw new RuntimeException("Failed to register user on Keycloak.");
        }
    }

    private static KeycloakUserRegistrationRequest getKeycloakUserRegistrationRequest(Officer officer) {
        String fullName = officer.getOfficerName();
        String[] nameParts = fullName.split(" ");
        String firstName = nameParts.length > 0 ? nameParts[0] : "";
        String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        KeycloakUserRegistrationRequest user = new KeycloakUserRegistrationRequest();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(officer.getOfficerEmail());
        user.setSubscriptionStatus(Constants.ACTIVE_STATUS);
        user.setSubscriptionType(officer.getSubscriptionType().getValue());
        return user;
    }

    public OfficerDto updateOfficer(String officerId, OfficerDto officerDto) {
        if (officerId == null) {
            throw new IllegalArgumentException("officerId is required for update operation");
        }

        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new IllegalArgumentException("Officer not found with id:" + officerId));

        BeanUtils.copyProperties(officerDto, existingOfficer, getNullPropertyNames(officerDto));

        Officer updatedOfficer = officerRepo.save(existingOfficer);

        return mapper.mapToOfficerDto(updatedOfficer);
    }

    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();
        Set<String> emptyNames = new HashSet<>();
        for (PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) emptyNames.add(pd.getName());
        }
        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }

    @Transactional
    public void updateOfficerIdToNullAndDeleteOfficer(String officerId) {
        investigationDetailsRepo.updateOfficerIdToNullByOfficerId(officerId);
        victimRepo.updateOfficerIdToNull(officerId);
        officerRepo.deleteById(officerId);
    }

    private void assignFileToOfficer(FileEntity fileEntity, Officer officer) {
        if (fileEntity.getFileName().contains("aadhar")) {
            officer.setAadharFile(fileEntity);
        } else if (fileEntity.getFileName().contains("pan")) {
            officer.setPanFile(fileEntity);
        } else if (fileEntity.getFileName().contains("passport")) {
            officer.setPassportFile(fileEntity);
        }
    }


    public OfficerDto getSingleOfficer(String officerEmail) {
        Optional<Officer> optionalOfficer = officerRepo.findByOfficerEmail(officerEmail);
        Officer officer = optionalOfficer.orElseThrow(() -> new NoSuchElementException("Officer not found with email: " + officerEmail));
        return mapper.mapToOfficerDto(officer);
    }

    public List<FileEntity> findVictimFilesByVictimId(String victimId) {
        List<FileEntity> victimFiles = victimRepo.findFilesByVictimId(victimId);

        return victimFiles;
    }

    public List<FileEntity> findOffenderFilesByVictimId(String victimId) {

        List<String> listOfIds = offenderRepo.findOffenderId(victimId);

        List<FileEntity> fileEntities = new ArrayList<>();

        listOfIds.forEach(offenderId -> {
            List<FileEntity> list = offenderRepo.findFilesByOffenderId(offenderId);

            fileEntities.addAll(list);
        });

        return fileEntities;
    }

    public List<Evidence> fetchEvidenceFiles(String victimId) {
        return evidenceRepo.findEvidenceByVictimId(victimId);
    }

    public ResponseEntity<InputStreamResource> downloadFile(String filePath) throws IOException {

        try {
            S3Object s3Object = s3ClientConfig.getS3Client().getObject(bucketName, filePath);
            S3ObjectInputStream inputStream = s3Object.getObjectContent();

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filePath);
            headers.add(HttpHeaders.CONTENT_TYPE, Files.probeContentType(new File(filePath).toPath())); // Optional: Set content type

            InputStreamResource resource = new InputStreamResource(inputStream);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (AmazonS3Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @SneakyThrows
    public boolean updateFileById(String fileId, MultipartFile file) {
        Optional<FileEntity> optionalFile = fileEntityRepository.findById(fileId);

        if (optionalFile.isPresent()) {
            FileEntity fileEntity = optionalFile.get();
            String fileType = StringUtils.substringBefore(fileEntity.getFilePath(), "/");
            try {
                deleteFileFromS3(fileEntity.getFilePath());
                saveFile(file,fileType);
            } catch (IOException e) {
                throw new IOException("Error updating file", e);
            }
            return true;
        } else {
            throw new FileNotFoundException("File Not Found with ID: " + fileId);
        }
    }

    @SneakyThrows
    @Transactional
    public boolean deleteVictimFileById(String victimId, String fileId) {
        Optional<Victim> optionalVictim = victimRepo.findById(victimId);
        Optional<FileEntity> optionalFile = fileEntityRepository.findById(fileId);

        if (optionalVictim.isPresent() && optionalFile.isPresent()) {
            Victim victim = getVictim(fileId, optionalVictim.get());
            victimRepo.save(victim);
            FileEntity fileEntity = optionalFile.get();
            String filePath = fileEntity.getFilePath();
            deleteFileFromS3(filePath);
            fileEntityRepository.deleteById(fileId);
            return true;
        } else {
            if (optionalVictim.isEmpty()) {
                throw new Exception("Victim not found with ID: " + victimId);
            }
            throw new Exception("File not found with ID: " + fileId);
        }
    }

    private static Victim getVictim(String fileId, Victim victim) {

        if (victim.getAadharFile() != null && victim.getAadharFile().getFileId().equals(fileId)) {
            victim.setAadharFile(null);
        } else if (victim.getPanFile() != null && victim.getPanFile().getFileId().equals(fileId)) {
            victim.setPanFile(null);
        } else if (victim.getPassportFile() != null && victim.getPassportFile().getFileId().equals(fileId)) {
            victim.setPassportFile(null);
        }
        return victim;
    }

    @SneakyThrows
    @Transactional
    public boolean deleteOffenderFileById(String offenderId, String fileId) {
        Optional<Offender> optionalOffender = offenderRepo.findById(offenderId);
        Optional<FileEntity> optionalFile = fileEntityRepository.findById(fileId);

        if (optionalOffender.isPresent() && optionalFile.isPresent()) {
            Offender offender = getOffender(fileId, optionalOffender.get());

            offenderRepo.save(offender);
            FileEntity fileEntity = optionalFile.get();
            String filePath = fileEntity.getFilePath();
            deleteFileFromS3(filePath);
            fileEntityRepository.deleteById(fileId);
            return true;
        } else {
            if (optionalOffender.isEmpty()) {
                throw new Exception("Offender not found with ID: " + offenderId);
            }
            throw new Exception("File not found with ID: " + fileId);
        }
    }

    private static Offender getOffender(String fileId, Offender offender) {

        if (offender.getAadharFile() != null && offender.getAadharFile().getFileId().equals(fileId)) {
            offender.setAadharFile(null);
        } else if (offender.getPanFile() != null && offender.getPanFile().getFileId().equals(fileId)) {
            offender.setPanFile(null);
        } else if (offender.getPassportFile() != null && offender.getPassportFile().getFileId().equals(fileId)) {
            offender.setPassportFile(null);
        }
        return offender;
    }

    @SneakyThrows
    public boolean updateEvidenceFileById(String evidenceId, MultipartFile file) {
        Optional<Evidence> optionalEvidence = evidenceRepo.findById(evidenceId);

        if (optionalEvidence.isPresent()) {
            try {
                saveFile(file,Constants.EVIDENCE);  // Specify your directory path
            } catch (IOException e) {
                throw new IOException("Error reading file content", e);
            }
            return true;
        } else {
            throw new FileNotFoundException("File not Found with ID: " + evidenceId);
        }
    }

    @SneakyThrows
    public boolean deleteEvidenceById(String evidenceId) {
        Optional<Evidence> optionalEvidence = evidenceRepo.findById(evidenceId);

        if (optionalEvidence.isPresent()) {
            Evidence evidence = optionalEvidence.get();
            String filePath = evidence.getEvidenceFilePath();
            deleteFileFromS3(filePath);
            evidenceRepo.deleteById(evidenceId);
            return true;
        } else {
            throw new Exception("Evidence data not found with ID: " + optionalEvidence);
        }
    }

    public boolean addNewEvidence(String victimId, List<Evidence> evidenceList, MultipartFile[] newEvidenceFiles) {

        try {
            Optional<Victim> optionalVictim = victimRepo.findById(victimId);

            if (optionalVictim.isEmpty()) {
                throw new Exception("Victim not found");
            }

            Victim victim = optionalVictim.get();

            for (int i = 0; i < evidenceList.size(); i++) {
                Evidence evidence = evidenceList.get(i);
                evidence.setVictim(victim);
                if (newEvidenceFiles[i].getOriginalFilename().contains(evidence.getEvidenceName())) {
                    String filePath = saveFile(newEvidenceFiles[i],Constants.EVIDENCE);  // Specify your directory path
                    // Set the file path in evidence
                    evidence.setEvidenceFilePath(filePath);
                    //    evidence.setEvidenceData(newEvidenceFiles[i].getBytes());
                }
            }

            evidenceRepo.saveAll(evidenceList);
            return true;
        } catch (Exception e) {
            System.out.println("Error saving evidence : " + e.getMessage());
            return false;
        }

    }

    public List<VictimListDto> fetchVictimDetails(String officerId) {
        List<Victim> allVictims = victimRepo.findByOfficerId(officerId);
        return allVictims.stream()
                .map(victim -> mapper.mapToVictimListDto(victim))
                .collect(Collectors.toList());
    }

    public VictimProfileDto fetchSingleVictimDetails(String victimId) {
        Optional<Victim> singleVictim = victimRepo.findById(victimId);
        return mapper.mapToVictimProfileDto(singleVictim.get());

    }

    public VictimProfileDto updateVictimProfile(String victimId,VictimProfileDto victimProfileDto,MultipartFile[] files) throws IOException {
        if (victimId== null) {
            throw new IllegalArgumentException("officerId is required for update operation");
        }
        Victim existingVictim = victimRepo.findById(victimId)
                .orElseThrow(() -> new IllegalArgumentException("victim not found with id:" + victimId));

        // Copy non-null properties from officerDto to existingOfficer
        BeanUtils.copyProperties(victimProfileDto, existingVictim, getNullPropertyNames(victimProfileDto));

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                if (isFileForVictim(file, existingVictim)) {
                    FileEntity fileEntity = new FileEntity();
                    fileEntity.setFileName(file.getOriginalFilename());
                    String filePath = saveFile(file,Constants.VICTIM);  // Save file and get its path
                    fileEntity.setFilePath(filePath);
                    fileEntity = fileEntityRepository.save(fileEntity);

                    assignFileToVictim(fileEntity, existingVictim);
                }
            }
        }

        // Save the updated officer
        Victim updatedVictim = victimRepo.save(existingVictim);
        return mapper.mapToVictimProfileDto(updatedVictim);
    }

    public List<OffenderDto> fetchAllOffender(String officerId) {
        List<Offender> offenderList = offenderRepo.findByOfficerId(officerId);


        return offenderList.stream()
                .map(offender -> mapper.mapToOffenderDto(offender))
                .collect(Collectors.toList());
    }

    public OffenderDto fetchSingleOffender(String offenderId){
        Optional<Offender> offender=offenderRepo.findById(offenderId);
        return mapper.mapToOffenderDto(offender.get());
    }

    public OffenderDto updateOffenderProfile(String offenderId,OffenderDto offenderDto,MultipartFile[] files) throws Exception {
        if(offenderId==null){
            throw new IllegalArgumentException("offenderId is required for update");
        }
        Offender existingOffender = offenderRepo.findById(offenderId)
                .orElseThrow(() -> new IllegalArgumentException("Offender not found with id: " + offenderId));


        BeanUtils.copyProperties(offenderDto, existingOffender, getNullPropertyNames(offenderDto));

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Convert file to bytes (if needed)
                if (isFileForOffender(file, existingOffender)) {
                    FileEntity fileEntity = new FileEntity();
                    fileEntity.setFileName(file.getOriginalFilename());
                    String filePath = saveFile(file,Constants.OFFENDER);  // Save file and get its path
                    fileEntity.setFilePath(filePath);
                    fileEntity = fileEntityRepository.save(fileEntity);

                    // Assign the FileEntity to the witness
                    assignFileToOffender(fileEntity, existingOffender);
                }
            }
        }


        Offender updateoffender = offenderRepo.save(existingOffender);

        return mapper.mapToOffenderDto(updateoffender);
    }

    @SneakyThrows
    public boolean caseFile(String victimId, Map<String, String> firDetails, MultipartFile files) {
        Optional<Victim> optionalVictim = victimRepo.findById(victimId);

        if (optionalVictim.isEmpty())
            throw new Exception("Victim is not present.");

        Victim victim = optionalVictim.get();
        victim.setFirNo(firDetails.get("firNo"));
        victim.setShortDescription(firDetails.get("shortDescription"));
        victim.setCaseStatus("in progress");

        Victim updatedVictim = victimRepo.save(victim);

        if (files != null && !files.isEmpty()) {
            try {
                FileEntity fileEntity = new FileEntity();
                fileEntity.setFileName(files.getOriginalFilename());
                String filePath = saveFile(files,Constants.VICTIM);  // Specify your directory path
                fileEntity.setFilePath(filePath);
                fileEntity = fileEntityRepository.save(fileEntity);
            } catch (IOException e) {
                // Handle file processing exception
                e.printStackTrace(); // Log or handle the exception as per your requirement
            }
        }
        return true;

    }

    public VictimDto fetchSingleVictimDto(String victimId) {
        Optional<Victim> optionalVictim = victimRepo.findById(victimId);
        if (optionalVictim.isEmpty()) {
            throw new IllegalArgumentException("Victim is not present");
        }
        return mapper.mapToVictimDto(optionalVictim.get());
    }

    public VictimDto updateVictimDto(String victimId, VictimDto victimDto, MultipartFile[] victimFiles, MultipartFile[] offenderFiles) {
        try {
            if (victimId == null) {
                log.error("Victim ID is not present");
                throw new IllegalArgumentException("victimId is not present");
            }

            log.info("Updating victim with ID: {}", victimId);
            Victim existingVictim = victimRepo.findById(victimId)
                    .orElseThrow(() -> {
                        log.error("Victim not found with id: {}", victimId);
                        return new IllegalArgumentException("Victim not found with id:" + victimId);
                    });

            String[] nullPropertyNames = getNullPropertyNames(victimDto);
            BeanUtils.copyProperties(victimDto, existingVictim, nullPropertyNames);

            existingVictim.setCrimesDetails(mapper.mapToCrimeDetails(victimDto.getCrimesDetails()));
            List<Offender> offenderList = victimDto.getOffenderList().stream()
                    .map(offenderDto -> mapper.mapToOffender(offenderDto)).collect(Collectors.toList());

            updateVictimFiles(existingVictim, victimFiles);
            updateOffenderFiles(offenderList, offenderFiles);

            crimeDetailsRepo.save(existingVictim.getCrimesDetails());
            existingVictim.setOffenderList(offenderList);
            Victim updatedVictim = victimRepo.save(existingVictim);
            log.info("Victim updated successfully: {}", updatedVictim);

            return mapper.mapToVictimDto(updatedVictim);
        } catch (Exception e) {
            log.error("Unexpected error while updating victim: {}", e.getMessage());
            throw new RuntimeException("Error updating victim: " + e.getMessage(), e);
        }
    }

    private void updateOffenderFiles(List<Offender> offenderList, MultipartFile[] offenderFiles) {
        try {
            Set<String> uploadedFileTypes = new HashSet<>();
            if (offenderFiles != null) {
                for (MultipartFile file : offenderFiles) {
                    String fileName = file.getOriginalFilename();
                    String fileType = getFileType(fileName);
                    uploadedFileTypes.add(fileType);
                    log.info("Processing offender file: {}", fileName);

                    for (Offender existingOffender : offenderList) {
                        FileEntity offenderFile = getFileEntityForType(existingOffender, fileType);

                        if (offenderFile != null) {
                            log.info("Deleting existing file for offender: {}", existingOffender.getOffenderId());
                            deleteFileFromS3(offenderFile.getFilePath());
                        } else {
                            offenderFile = new FileEntity();
                        }

                        String filePath = saveFile(file, Constants.OFFENDER);
                        offenderFile.setFileName(fileName);
                        offenderFile.setFilePath(filePath);
                        FileEntity updatedFileEntity = fileEntityRepository.save(offenderFile);
                        setFileEntityForType(existingOffender, fileType, updatedFileEntity);
                    }
                }
            }

            for (Offender existingOffender : offenderList) {
                if (!uploadedFileTypes.contains("aadhar")) {
                    String aadharFileId = existingOffender.getAadharFile().getFileId();
                    log.info("Removing Aadhar file for offender: {}", existingOffender.getOffenderId());
                    deleteFileIfExists(existingOffender.getAadharFile());
                    existingOffender.setAadharFile(null);
                    offenderRepo.save(existingOffender);
                    fileEntityRepository.deleteById(aadharFileId);
                }
                if (!uploadedFileTypes.contains("passport")) {
                    String passportFileId = existingOffender.getPassportFile().getFileId();
                    log.info("Removing Passport file for offender: {}", existingOffender.getOffenderId());
                    deleteFileIfExists(existingOffender.getPassportFile());
                    existingOffender.setPassportFile(null);
                    offenderRepo.save(existingOffender);
                    fileEntityRepository.deleteById(passportFileId);
                }
                if (!uploadedFileTypes.contains("pan")) {
                    String panFileId = existingOffender.getPanFile().getFileId();
                    log.info("Removing PAN file for offender: {}", existingOffender.getOffenderId());
                    deleteFileIfExists(existingOffender.getPanFile());
                    existingOffender.setPanFile(null);
                    offenderRepo.save(existingOffender);
                    fileEntityRepository.deleteById(panFileId);
                }
            }
            offenderRepo.saveAll(offenderList);
            log.info("Offender files updated successfully");
        } catch (IOException e) {
            log.error("I/O error while updating offender files: {}", e.getMessage());
            throw new RuntimeException("Error updating offender files: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error while updating offender files: {}", e.getMessage());
            throw new RuntimeException("Error updating offender files: " + e.getMessage(), e);
        }
    }

    private void updateVictimFiles(Victim existingVictim, MultipartFile[] victimFiles) {
        try {
            Set<String> uploadedFileTypes = new HashSet<>();

            if (victimFiles != null) {
                for (MultipartFile file : victimFiles) {
                    String fileName = file.getOriginalFilename();
                    String fileType = getFileType(fileName);
                    uploadedFileTypes.add(fileType);
                    log.info("Processing victim file: {}", fileName);

                    FileEntity victimFile = getFileEntityForType(existingVictim, fileType);
                    if (victimFile != null) {
                        log.info("Deleting existing file for victim: {}", existingVictim.getVictimId());
                        deleteFileFromS3(victimFile.getFilePath());
                    } else {
                        victimFile = new FileEntity();
                    }

                    String filePath = saveFile(file, Constants.VICTIM);
                    victimFile.setFileName(fileName);
                    victimFile.setFilePath(filePath);
                    FileEntity updatedVictimFile = fileEntityRepository.save(victimFile);
                    setFileEntityForType(existingVictim, fileType, updatedVictimFile);
                }
            }

            if (victimFiles == null || victimFiles.length == 0) {
                log.info("No files uploaded. Removing all files for victim: {}", existingVictim.getVictimId());
                removeAllFiles(existingVictim);
            } else {
                if (!uploadedFileTypes.contains("aadhar")) {
                    String aadharFileId = existingVictim.getAadharFile().getFileId();
                    log.info("Removing Aadhar file for victim: {}", existingVictim.getVictimId());
                    deleteFileIfExists(existingVictim.getAadharFile());
                    existingVictim.setAadharFile(null);
                    fileEntityRepository.deleteById(aadharFileId);
                }
                if (!uploadedFileTypes.contains("passport")) {
                    String passportFileId = existingVictim.getPassportFile().getFileId();
                    log.info("Removing Passport file for victim: {}", existingVictim.getVictimId());
                    deleteFileIfExists(existingVictim.getPassportFile());
                    existingVictim.setPassportFile(null);
                    fileEntityRepository.deleteById(passportFileId);
                }
                if (!uploadedFileTypes.contains("pan")) {
                    String panFileId = existingVictim.getPanFile().getFileId();
                    log.info("Removing PAN file for victim: {}", existingVictim.getVictimId());
                    deleteFileIfExists(existingVictim.getPanFile());
                    existingVictim.setPanFile(null);
                    fileEntityRepository.deleteById(panFileId);
                }
            }
        } catch (IOException e) {
            log.error("I/O error while updating victim files: {}", e.getMessage());
            throw new RuntimeException("Error updating victim files: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error while updating victim files: {}", e.getMessage());
            throw new RuntimeException("Error updating victim files: " + e.getMessage(), e);
        }
    }

    private FileEntity getFileEntityForType(Offender offender, String fileType) {
        return switch (fileType) {
            case "aadhar" -> offender.getAadharFile();
            case "passport" -> offender.getPassportFile();
            case "pan" -> offender.getPanFile();
            default -> null;
        };
    }

    private void setFileEntityForType(Offender offender, String fileType, FileEntity fileEntity) {
        switch (fileType) {
            case "aadhar" -> offender.setAadharFile(fileEntity);
            case "passport" -> offender.setPassportFile(fileEntity);
            case "pan" -> offender.setPanFile(fileEntity);
        }
    }

    private void deleteFileIfExists(FileEntity fileEntity) {
        if (fileEntity != null) {
            log.info("Deleting file from S3: {}", fileEntity.getFilePath());
            deleteFileFromS3(fileEntity.getFilePath());
        }
    }

    private void removeAllFiles(Victim victim) {
        log.info("Removing all files for victim: {}", victim.getVictimId());
        String aadharFileId = victim.getAadharFile().getFileId();
        String passportFileId = victim.getPassportFile().getFileId();
        String panFileId = victim.getPanFile().getFileId();

        deleteFileIfExists(victim.getAadharFile());
        victim.setAadharFile(null);
        fileEntityRepository.deleteById(aadharFileId);

        deleteFileIfExists(victim.getPassportFile());
        victim.setPassportFile(null);
        fileEntityRepository.deleteById(passportFileId);

        deleteFileIfExists(victim.getPanFile());
        victim.setPanFile(null);
        fileEntityRepository.deleteById(panFileId);
    }

    private FileEntity getFileEntityForType(Victim victim, String fileType) {
        return switch (fileType) {
            case "aadhar" -> victim.getAadharFile();
            case "passport" -> victim.getPassportFile();
            case "pan" -> victim.getPanFile();
            default -> null;
        };
    }

    private void setFileEntityForType(Victim victim, String fileType, FileEntity fileEntity) {
        switch (fileType) {
            case "aadhar" -> victim.setAadharFile(fileEntity);
            case "passport" -> victim.setPassportFile(fileEntity);
            case "pan" -> victim.setPanFile(fileEntity);
        }
    }

    private String getFileType(String filename) {
        if (filename.contains("aadhar")) {
            return "aadhar";
        } else if (filename.contains("passport")) {
            return "passport";
        } else if (filename.contains("pan")) {
            return "pan";
        }
        return null;
    }

    public VictimDto caseReopen(String victimId) {
        if (victimId == null) {
            throw new IllegalArgumentException("victimId cannot be null");
        }
        Optional<Victim> optionalVictim = victimRepo.findById(victimId);
        if (optionalVictim.isPresent()) {
            Victim victim = optionalVictim.get();
            try{
                victim.setCaseStatus("in progress");
                victimRepo.save(victim); // Save the changes to the victim's case status
            } catch (Exception e) {
                e.printStackTrace();
            }
            return mapper.mapToVictimDto(victim);
        } else {
            throw new IllegalArgumentException("Victim with ID " + victimId + " not found");
        }
    }

    @Transactional
    public boolean caseTransfer(String victimId, String officerId, String email) {
        if (officerId == null && email == null) {
            throw new IllegalArgumentException("officerId or email is not present");
        }

        Optional<Officer> optionalTransferringOfficer = officerRepo.findById(officerId);
        if (optionalTransferringOfficer.isEmpty()) {
            throw new IllegalArgumentException("Officer not found for ID: " + officerId);
        }
        Officer transferringOfficer = optionalTransferringOfficer.get();

        Optional<Officer> optionalReceivingOfficer = officerRepo.findByOfficerEmail(email);
        if (optionalReceivingOfficer.isEmpty()) {
            throw new IllegalArgumentException("Officer not found for email: " + email);
        }
        Officer receivingOfficer = optionalReceivingOfficer.get();

        Victim victimToTransfer = victimRepo.findById(victimId)
                .orElseThrow(() -> new IllegalArgumentException("Victim not found for ID: " + victimId));

        Victim clonedVictim = cloneVictimWithClonedFiles(victimToTransfer);


        List<Offender> clonedOffenders = new ArrayList<>();
        List<Offender> originalOffenders = victimToTransfer.getOffenderList();
        if (originalOffenders != null) {
            for (Offender offender : originalOffenders) {
                clonedOffenders.add(cloneOffenderWithClonedFiles(offender));
            }
        }

        List<InvestigationDetails> originalInvestigationDetails = investigationDetailsRepo.findByVictimId(victimId);
        List<InvestigationDetails> clonedInvestigationDetails = new ArrayList<>();
        if (originalInvestigationDetails != null) {
            for (InvestigationDetails investigationDetails : originalInvestigationDetails) {
                InvestigationDetails temp = mapper.cloneInvestigation(investigationDetails);
                temp.setVictim(clonedVictim);
                clonedInvestigationDetails.add(temp);
            }
        }

        clonedVictim.setOffenderList(clonedOffenders);
        receivingOfficer.getInvestigationDetailsList().addAll(clonedInvestigationDetails);


        crimeDetailsRepo.save(clonedVictim.getCrimesDetails());
        offenderRepo.saveAll(clonedVictim.getOffenderList());
        investigationDetailsRepo.saveAll(clonedInvestigationDetails);

        receivingOfficer.getVictimList().add(clonedVictim);

        victimToTransfer.setCaseStatus("Completed");
        victimRepo.save(victimToTransfer);

        Victim savedVictim = victimRepo.save(clonedVictim);
        Officer updatedOfficer = officerRepo.save(receivingOfficer);
        return true; // Indicate that victim and investigation were transferred successfully
    }

    private Victim cloneVictimWithClonedFiles(Victim original) {
        if (original == null) {
            return null;
        }
        Victim clonedVictim = mapper.cloneVictim(original);
        if (original.getAadharFile() != null) {
            fileEntityRepository.save(clonedVictim.getAadharFile());
        }
        if (original.getPanFile() != null) {
            fileEntityRepository.save(clonedVictim.getPanFile());
        }
        if (original.getPassportFile() != null) {
            fileEntityRepository.save(clonedVictim.getPassportFile());
        }
        return clonedVictim;
    }

    private Offender cloneOffenderWithClonedFiles(Offender original) {
        if (original == null) {
            return null;
        }
        Offender clonedOffender = mapper.cloneOffender(original);
        if (original.getAadharFile() != null) {
            fileEntityRepository.save(clonedOffender.getAadharFile());
        }
        if (original.getPanFile() != null) {
            fileEntityRepository.save(clonedOffender.getPanFile());
        }
        if (original.getPassportFile() != null) {
            fileEntityRepository.save(clonedOffender.getPassportFile());
        }
        return clonedOffender;
    }

    public HelpAndSupportDto saveHelpAndSupport(HelpAndSupportDto helpAndSupportDto, MultipartFile issueImage) {
        try {
            Officer officer = officerRepo.findById(helpAndSupportDto.getOfficerId()).get();
            HelpAndSupport helpAndSupport = mapper.mapToHelpAndSupport(helpAndSupportDto);
            helpAndSupport.setOfficer(officer);
            helpAndSupport.setUuid(UUID.randomUUID().toString().split("-")[0]);

            if (issueImage != null) {
                FileEntity fileEntity = new FileEntity();
                fileEntity.setFileName(issueImage.getOriginalFilename());
                String filePath = saveFile(issueImage,Constants.SUPPORT);
                fileEntity.setFilePath(filePath);
                FileEntity savedFileEntity = fileEntityRepository.save(fileEntity);
                helpAndSupport.setIssueImage(savedFileEntity);
            }

            HelpAndSupport savedData = helpAndSupportRepo.save(helpAndSupport);
            return mapper.mapToHelpAndSupportDto(savedData);
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public List<HelpAndSupportDto> getAllHelpAndSupportWithOfficerName(String officerId) {

        List<HelpAndSupport> helpAndSupportList = helpAndSupportRepo.findByOfficer(officerId);

        return helpAndSupportList.stream()
                .map(helpAndSupport -> {
                    HelpAndSupportDto dto = mapper.mapToHelpAndSupportDto(helpAndSupport);
                    dto.setOfficerId(helpAndSupport.getOfficer().getOfficerId());
                    dto.setOfficerName(helpAndSupport.getOfficer().getOfficerName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public HelpAndSupportDto getHelpAndServiceByUuid(String uuid) {
        HelpAndSupport helpAndSupport = helpAndSupportRepo.findByUuid(uuid);

        HelpAndSupportDto dto = mapper.mapToHelpAndSupportDto(helpAndSupport);
        dto.setOfficerId(helpAndSupport.getOfficer().getOfficerId());
        dto.setOfficerName(helpAndSupport.getOfficer().getOfficerName());

        return dto;
    }

    public List<HelpAndSupportDto> getAllHelpAndSupport() {
        List<HelpAndSupport> list = helpAndSupportRepo.findAll();

        return list.stream()
                .map(helpAndSupport -> {
                    HelpAndSupportDto dto = mapper.mapToHelpAndSupportDto(helpAndSupport);
                    dto.setOfficerId(helpAndSupport.getOfficer().getOfficerId());
                    dto.setOfficerName(helpAndSupport.getOfficer().getOfficerName());
                    return dto;
                })
                .collect(Collectors.toList());


    }


    public HelpAndSupportDto updateHelpAndSupportByUuid(String uuid, HelpAndSupportDto helpAndSupportDto, MultipartFile issueImage) {
        if (uuid == null || helpAndSupportDto == null) {
            throw new IllegalArgumentException("UUID and HelpAndSupportDto must not be null");
        }

        HelpAndSupport existingHelpAndSupport = helpAndSupportRepo.findByUuid(uuid);
        if (existingHelpAndSupport == null) {
            throw new EntityNotFoundException("HelpAndSupport not found for UUID: " + uuid);
        }

        try {
            // Copy properties from DTO to existing entity
            BeanUtils.copyProperties(helpAndSupportDto, existingHelpAndSupport, getNullPropertyNames(helpAndSupportDto));

            // Handle existing file entity
            FileEntity fileEntity = existingHelpAndSupport.getIssueImage();
            if (fileEntity != null) {
                deleteFileFromS3(fileEntity.getFilePath());
            }

            // Save the new file if provided
            if (issueImage != null && !issueImage.isEmpty()) {
                String filePath = saveFile(issueImage, Constants.SUPPORT);
                fileEntity = new FileEntity(); // Create a new FileEntity if needed
                fileEntity.setFilePath(filePath);
                fileEntity.setFileName(issueImage.getOriginalFilename());

                // Save the new FileEntity
                FileEntity savedFileEntity = fileEntityRepository.save(fileEntity);
                existingHelpAndSupport.setIssueImage(savedFileEntity);
            }

            // Save the updated HelpAndSupport entity
            HelpAndSupport updatedHelpAndSupport = helpAndSupportRepo.save(existingHelpAndSupport);

            // Map to DTO
            HelpAndSupportDto dto = mapper.mapToHelpAndSupportDto(updatedHelpAndSupport);
            dto.setOfficerId(updatedHelpAndSupport.getOfficer().getOfficerId());
            dto.setOfficerName(updatedHelpAndSupport.getOfficer().getOfficerName());

            return dto;

        } catch (Exception e) {
            log.error("Error updating HelpAndSupport: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update HelpAndSupport", e);
        }
    }

    public boolean deleteByUuid(String uuid) {
        HelpAndSupport helpAndSupport = helpAndSupportRepo.findByUuid(uuid);
        if (helpAndSupport != null) {
            deleteFileFromS3(helpAndSupport.getIssueImage().getFilePath());
            helpAndSupportRepo.delete(helpAndSupport);
            return true;
        } else {
            throw new EntityNotFoundException("HelpAndSupport with UUID " + uuid + " not found");
        }
    }

    public boolean saveFeedback(FeedbackDto feedbackDto) {
        String officerId = feedbackDto.getOfficerId();

        Officer officer = officerRepo.findById(officerId).get();
        Feedback feedback = mapper.mapToFeedback(feedbackDto);
        feedback.setOfficer(officer);

        Feedback savedFeedback = feedbackRepo.save(feedback);

        if (savedFeedback != null)
            return true;
        else
            return false;
    }

    public List<FeedbackDto> getListOfFeedback() {
        List<Feedback> feedbacks = feedbackRepo.findAll();

        return feedbacks.stream()
                .map(feedback -> {
                    FeedbackDto dto = mapper.mapToFeedbackDto(feedback);
                    dto.setOfficerId(feedback.getOfficer().getOfficerId());
                    dto.setOfficerName(feedback.getOfficer().getOfficerName());
                    dto.setOfficerPost(feedback.getOfficer().getOfficerPost());
                    dto.setOfficerStation(feedback.getOfficer().getOfficerStation());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    private boolean isFileForWitness(MultipartFile file, Witness witness) {
        return file.getOriginalFilename().contains(witness.getWitnessName());
    }

    private void assignFileToWitness(FileEntity fileEntity, Witness witness) {
        if (fileEntity.getFileName().contains("aadhar")) {
            witness.setAadharFile(fileEntity);
        } else if (fileEntity.getFileName().contains("pan")) {
            witness.setPanFile(fileEntity);
        } else if (fileEntity.getFileName().contains("passport")) {
            witness.setPassportFile(fileEntity);
        }
    }

    @Transactional
    public List<WitnessDto> addWitness(List<WitnessDto> witnessDtos, String victimId, MultipartFile[] files) throws IOException {

        Victim victim = victimRepo.findById(victimId).
                orElseThrow(() -> new IllegalArgumentException("Victim not found for ID: " + victimId));

        List<Witness> witnessList = new ArrayList<>();

        for (WitnessDto witnessDto1 : witnessDtos) {
            Witness witness = mapper.mapToWitness(witnessDto1);

            for (MultipartFile file : files) {
                if (isFileForWitness(file, witness)) {
                    FileEntity fileEntity = new FileEntity();
                    fileEntity.setFileName(file.getOriginalFilename());
                    String filePath = saveFile(file,Constants.WITNESS);  // Specify your directory path
                    fileEntity.setFilePath(filePath);
                    fileEntity = fileEntityRepository.save(fileEntity);
                    assignFileToWitness(fileEntity, witness);
                }
            }

            witness = witnessRepo.save(witness);
            witnessList.add(witness);
        }

        List<Witness> existingWitnesses = victim.getWitnessList();
        existingWitnesses.addAll(witnessList);
        victim.setWitnessList(existingWitnesses);

        victimRepo.save(victim);
        return witnessList.stream()
                .map(witness -> mapper.mapToWitnessDto(witness))
                .collect(Collectors.toList());
    }

    public List<WitnessDto> getAllList(String victimId){
        List<Witness> allWitness = witnessRepo.findByVictimId(victimId);
        return allWitness.stream().map(witness -> mapper.mapToWitnessDto(witness)).toList();
    }

    public WitnessDto getSingleWitness(String witnessId) {
        if (witnessId == null) {
            throw new IllegalArgumentException("Witness id is not present");
        }
        Optional<Witness> optionalWitness = witnessRepo.findById(witnessId);
        if (optionalWitness.isPresent()) {
            Witness witness = optionalWitness.get();
            return mapper.mapToWitnessDto(witness);
        } else {
            throw new IllegalArgumentException("Witness is not found" + witnessId);
        }
    }

    public void deleteWitness(String witnessId) {
        if (witnessId == null) {
            throw new IllegalArgumentException("Witness id is not present");
        }

        Optional<Witness> optionalWitness = witnessRepo.findById(witnessId);
        if (optionalWitness.isPresent()) {
            Witness witness = optionalWitness.get();
            witnessRepo.delete(witness);
        } else {
            throw new IllegalArgumentException("Witness not found for id: " + witnessId);
        }
    }

    public WitnessDto updateWitness(String witnessId, WitnessDto witnessDto, MultipartFile[] files) throws IOException {
        if (witnessId == null) {
            throw new IllegalArgumentException("witnessId is not present: " + witnessId);
        }

        Witness existingWitness = witnessRepo.findById(witnessId)
                .orElseThrow(() -> new IllegalArgumentException("Witness not found with id: " + witnessId));

        BeanUtils.copyProperties(witnessDto, existingWitness, getNullPropertyNames(witnessDto));

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                FileEntity fileEntity = new FileEntity();
                fileEntity.setFileName(file.getOriginalFilename());
                String filePath = saveFile(file,Constants.WITNESS);  // Save file and get its path
                fileEntity.setFilePath(filePath);

                fileEntity = fileEntityRepository.save(fileEntity);
                assignFileToWitness(fileEntity, existingWitness);
            }
        }
        Witness updatedWitness = witnessRepo.save(existingWitness);

        return mapper.mapToWitnessDto(updatedWitness);
    }

    private boolean isFileForFerrist(MultipartFile file, Ferrist ferrist) {
        return file.getOriginalFilename().contains(ferrist.getDocType());
    }


    public List<FerristDto> addFerrist(String victimId, List<FerristDto> ferristDto, MultipartFile[] files) throws IOException {
        if (victimId == null) {
            throw new IllegalArgumentException("victimId is not present:" + victimId);
        }
        Victim victim = victimRepo.findById(victimId).orElseThrow(() -> new IllegalArgumentException("Vicitm not found for Id:" + victimId));

        List<Ferrist> ferristList = new ArrayList<>();

        for (FerristDto ferristDto1 : ferristDto) {
            Ferrist ferrist = mapper.mapToFerrist(ferristDto1);
            for (MultipartFile file : files) {
                if (file != null ) {
                    FileEntity fileEntity = new FileEntity();
                    fileEntity.setFileName(file.getOriginalFilename());
                    String filePath = saveFile(file,Constants.FERRIST);
                    fileEntity.setFilePath(filePath);
                    FileEntity savedFileEntity = fileEntityRepository.save(fileEntity);
                    ferrist.setFerristFile(savedFileEntity);
                }
            }
            ferristList.add(ferristRepo.save(ferrist));
        }
        List<Ferrist> existingFerrist=victim.getFerristList();
        existingFerrist.addAll(ferristList);
        victim.setFerristList(existingFerrist);

        victimRepo.save(victim);
        return ferristList.stream()
                .map(ferrist -> mapper.mapToFerristDto(ferrist))
                .collect(Collectors.toList());
    }

    public List<FerristDto> fetchAllFerrist(String victimId) {
        List<Ferrist> allFerrist = ferristRepo.findByVictimId(victimId);
        return allFerrist.stream().map(ferrist -> mapper.mapToFerristDto(ferrist)).
                collect(Collectors.toList());
    }

    public FerristDto fetchSingleFerrist(String ferristId) {
        if (ferristId == null) {
            throw new IllegalArgumentException("ferristId is not present:" + ferristId);
        }
        Optional<Ferrist> optionalFerrist = ferristRepo.findById(ferristId);
        if (optionalFerrist.isPresent()) {
            Ferrist ferrist = optionalFerrist.get();
            return mapper.mapToFerristDto(ferrist);
        } else {
            throw new IllegalArgumentException("optionFerrist not found for Id:" + ferristId);
        }
    }

    public FerristDto updateFerrist(String ferristId, FerristDto ferristDto, MultipartFile[] files) throws IOException {
        if (ferristId == null) {
            throw new IllegalArgumentException("FerristId is not present:" + ferristId);
        }
        Ferrist existingFerrist = ferristRepo.findById(ferristId).orElseThrow(() -> new IllegalArgumentException("ferrist not found for Id:" + ferristId));

        BeanUtils.copyProperties(ferristDto, existingFerrist, getNullPropertyNames(ferristDto));


        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                FileEntity fileEntity = new FileEntity();
                fileEntity.setFileName(file.getOriginalFilename());
                String filePath = saveFile(file,Constants.FERRIST);  // Save file and get its path
                fileEntity.setFilePath(filePath);

                fileEntity = fileEntityRepository.save(fileEntity);
                deleteFileFromS3(existingFerrist.getFerristFile().getFilePath());
                existingFerrist.setFerristFile(fileEntity);
            }
        }
        Ferrist updatedferrist = ferristRepo.save(existingFerrist);

        return mapper.mapToFerristDto(updatedferrist);
    }

    public List<FileEntity> fetchFerristFiles(String victimId) {
        if (victimId == null) {
            throw new IllegalArgumentException("victim is not present:" + victimId);
        }
        List<Ferrist> ferristList = ferristRepo.findByVictimId(victimId);

        return ferristList.stream()
                .map(Ferrist::getFerristFile) // Filter out Ferrist entities with null ferristFile
                .filter(Objects::nonNull) // Map Ferrist to FileEntity
                .collect(Collectors.toList());
    }
    public void deleteFerrist(String ferristId, String victimId) {
        Optional<Victim> optionalVictim = victimRepo.findById(victimId);

        if (optionalVictim.isPresent()) {
            Victim victim = optionalVictim.get();
            List<Ferrist> ferristList = victim.getFerristList();
            ferristList.removeIf(ferrist -> ferrist.getFerristId().equals(ferristId));
            victimRepo.save(victim);

            ferristRepo.deleteById(ferristId);
        } else {
            throw new IllegalArgumentException("Victim with id " + victimId + " not found");
        }
    }

    public Boolean enableOrDisableOfficer(String officerId, String status) {
        Optional<Officer> officerOpt = officerRepo.findById(officerId);

        if (officerOpt.isEmpty()) {
            return false;
        }
        Officer officer = officerOpt.get();
        boolean isEnabled = status.equals(Constants.ENABLED);
        boolean keycloakSuccess = keycloakService.enableOrDisableOfficer(officer.getOfficerEmail(), isEnabled);
        if (keycloakSuccess) {
            officer.setOfficerStatus(isEnabled);
            officerRepo.save(officer);
            return true;
        }
        return false;
    }
}