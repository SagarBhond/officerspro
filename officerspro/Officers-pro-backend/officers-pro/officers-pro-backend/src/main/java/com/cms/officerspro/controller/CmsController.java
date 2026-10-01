package com.cms.officerspro.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.cms.officerspro.constants.Constants;
import com.cms.officerspro.service.CmsService;
import com.cms.officerspro.dto.*;
import com.cms.officerspro.entity.Evidence;
import com.cms.officerspro.entity.FileEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Slf4j
@CrossOrigin(origins = "https://www.officerspro.in")
@RestController
@RequestMapping("/api/victim")
public class CmsController {

    @Autowired
    private CmsService cmsService;

    @Autowired
    private RestTemplate restTemplate;


    @PostMapping("/report")
    public ResponseEntity<?> addCase(@RequestPart("officerId") String officerId, @RequestPart("victimDto") String victimDtoJson,
                                              @RequestParam(value = "victim",required = false) MultipartFile[] victimFiles, @RequestParam(value = "offender",required = false) MultipartFile[] offenderFiles) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            VictimDto victimDto = objectMapper.readValue(victimDtoJson, VictimDto.class);

            OfficerDto savedVictim = cmsService.crimeReport(officerId, victimDto, victimFiles, offenderFiles);

            return ResponseEntity.ok(savedVictim);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/updateCrimeDetails")
    public ResponseEntity<Boolean> updateCrimeDetails(@RequestBody UpdateCrimeDetailsDto updateCrimeDetailsDto) {

        boolean isCrimeDetailsUpdated = cmsService.updateCrimeDetails(updateCrimeDetailsDto);

        return ResponseEntity.ok(isCrimeDetailsUpdated);
    }

    @PutMapping("/updateInvestigationById")
    public ResponseEntity<Boolean> updateInvestigationById(@RequestBody UpdateInvestigationByIdDto updateInvestigationByIdDto) {

        boolean isInvestigationUpdated = cmsService.updateInvestigationById(updateInvestigationByIdDto);

        return ResponseEntity.ok(isInvestigationUpdated);
    }

    @GetMapping("/getCaseDiary/{victimId}")
    public ResponseEntity<OfficerDto> getCaseDiary(@PathVariable("victimId") String victimId) {
        OfficerDto officerDto = cmsService.getCrimeReport(victimId);

        return ResponseEntity.ok(officerDto);
    }

    @PutMapping("/updateInvestigation")
    public ResponseEntity<?> updateInvestigation(@RequestBody UpdateInvestigationDto updateInvestigationDto) {
        boolean isUpdated = cmsService.updateInvestigation(updateInvestigationDto);
        if (isUpdated)
            return ResponseEntity.ok(true);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @PutMapping("/updateEvidence")
    public ResponseEntity<?> updateEvidence(@RequestPart("victimId") String victimId,
                                            @RequestPart("newEvidence") String newEvidenceJson,
                                            @RequestParam(value = "newEvidenceFiles", required = false) MultipartFile[] newEvidenceFiles) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Evidence> evidenceList = new ArrayList<>();

            JsonNode jsonNode = objectMapper.readTree(newEvidenceJson);
            jsonNode.fieldNames().forEachRemaining(index -> {
                try {
                    JsonNode evidenceNode = jsonNode.get(index);
                    Evidence evidence = objectMapper.treeToValue(evidenceNode, Evidence.class);
                    evidenceList.add(evidence);
                } catch (Exception e) {
                    System.out.println("Error : " + e.getMessage());
                }
            });

            boolean isUpdated = cmsService.addNewEvidence(victimId, evidenceList, newEvidenceFiles);

            return ResponseEntity.ok(isUpdated);
        } catch (Exception e) {
            System.out.println("Error : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/getOfficerDetails")
    public ResponseEntity<OfficerDto> getOfficerDetails() {
        OfficerDto officerDto = cmsService.getOfficerDetails();

        return ResponseEntity.ok(officerDto);
    }

    @PutMapping("/updateOfficer/{officerId}")
    public ResponseEntity<OfficerDto> updateOfficer(@PathVariable("officerId") String officerId, @RequestBody OfficerDto officerDto) {
        try {
            OfficerDto updatedOfficer = cmsService.updateOfficer(officerId, officerDto);
            return ResponseEntity.ok(updatedOfficer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/addNewOfficer")
    public ResponseEntity<OfficerDto> addNewOfficer(
            @RequestParam("officerDto") String officerDtoJson,
            @RequestParam(value = "files", required = false) MultipartFile[] files) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            OfficerDto officerDto = objectMapper.readValue(officerDtoJson, OfficerDto.class);
            OfficerDto savedDto = cmsService.addOfficer(officerDto, files);
            return ResponseEntity.ok(savedDto);
        } catch (JsonProcessingException e) {
            log.error("Error processing JSON: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null); // Bad Request
        } catch (RuntimeException e) {
            log.error("Error adding officer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // Conflict
        } catch (IOException e) {
            log.error("I/O error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Internal Server Error
        }
    }

    @GetMapping("/getOfficers")
    public List<OfficerListDto> getOfficers() {
        return this.cmsService.getOfficerList();
    }

    @GetMapping("/getSingleOfficer/{officerEmail}")
    public ResponseEntity<OfficerDto> getSingleOfficer(@PathVariable("officerEmail") String officerEmail) {
        try {
            OfficerDto officerDto = cmsService.getSingleOfficer(officerEmail);
            return new ResponseEntity<>(officerDto, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/deleteOfficer/{officerId}")
    public ResponseEntity<String> deleteOfficer(@PathVariable("officerId") String officerId) {
        try {
            cmsService.updateOfficerIdToNullAndDeleteOfficer(officerId);
            return new ResponseEntity<>("Officer deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/listOfVictimFiles/{victimId}")
    public ResponseEntity<?> getListOfVictimFiles(@PathVariable("victimId") String victimId) {
        List<FileEntity> list = cmsService.findVictimFilesByVictimId(victimId);

        return ResponseEntity.ok(list);
    }

    @GetMapping("/listOfOffenderFiles/{victimId}")
    public ResponseEntity<?> getListOfOffenderFiles(@PathVariable("victimId") String victimId) {
        List<FileEntity> list = cmsService.findOffenderFilesByVictimId(victimId);

        return ResponseEntity.ok(list);
    }

    @GetMapping("/listOfEvidence/{victimId}")
    public ResponseEntity<?> getEvidenceFiles(@PathVariable("victimId") String victimId) {
        List<Evidence> list = cmsService.fetchEvidenceFiles(victimId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("updateFileById/{fileId}")
    public ResponseEntity<?> updateFile(@PathVariable("fileId") String fileId, @RequestParam(value = "file",required = false) MultipartFile file) {
        boolean isUpdated = cmsService.updateFileById(fileId, file);

        if (isUpdated)
            return ResponseEntity.ok("File Updated.");
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @DeleteMapping("deleteVictimFileById/{victimId}/{fileId}")
    public ResponseEntity<?> deleteVictimFile(@PathVariable("victimId") String victimId, @PathVariable("fileId") String fileId) {
        boolean isDeleted = cmsService.deleteVictimFileById(victimId, fileId);

        if (isDeleted)
            return ResponseEntity.ok("File Deleted.");
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @DeleteMapping("deleteOffenderFileById/{offenderId}/{fileId}")
    public ResponseEntity<?> deleteOffenderFile(@PathVariable("offenderId") String offenderId, @PathVariable("fileId") String fileId) {
        boolean isDeleted = cmsService.deleteOffenderFileById(offenderId, fileId);

        if (isDeleted)
            return ResponseEntity.ok("File Deleted.");
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @PutMapping("updateEvidenceById/{evidenceId}")
    public ResponseEntity<?> updateEvidence(@PathVariable("evidenceId") String evidenceId, @RequestParam(value = "file",required = false) MultipartFile file) {
        boolean isUpdated = cmsService.updateEvidenceFileById(evidenceId, file);

        if (isUpdated)
            return ResponseEntity.ok("Evidence File Updated.");
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @DeleteMapping("deleteEvidenceById/{evidenceId}")
    public ResponseEntity<?> deleteEvidence(@PathVariable("evidenceId") String evidenceId) {
        boolean isDeleted = cmsService.deleteEvidenceById(evidenceId);

        if (isDeleted)
            return ResponseEntity.ok("Evidence data deleted.");
        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @GetMapping("/files")
    public ResponseEntity<InputStreamResource> downloadFile(@RequestParam("filePath") String filePath) throws IOException {
        return cmsService.downloadFile(filePath);
    }

    @GetMapping("/getVictimsDetails/{officerId}")
    public List<VictimListDto> fetchVictims(@PathVariable("officerId") String officerId) {
        List<VictimListDto> victimListDtos = this.cmsService.fetchVictimDetails(officerId);
        return victimListDtos;
    }

    @GetMapping("/getSingleVictim/{victimId}")
    public VictimProfileDto fetchAlldetailsfromVictim(@PathVariable("victimId") String victimId) {
        VictimProfileDto victimProfileDtos = this.cmsService.fetchSingleVictimDetails(victimId);
        return victimProfileDtos;
    }

    @PutMapping("/updateVictimProfile/{victimId}")
    public VictimProfileDto updateVictimProfileDetail(@PathVariable("victimId") String victimId, @RequestPart("victimProfileDto") String victimProfileDtoJson, @RequestParam(value = "files",required = false) MultipartFile[] files) throws IOException {
        ObjectMapper ob=new ObjectMapper();
        ob.registerModule(new JavaTimeModule());
        VictimProfileDto victimProfileDto = ob.readValue(victimProfileDtoJson, VictimProfileDto.class);

        VictimProfileDto updatedVictim = this.cmsService.updateVictimProfile(victimId, victimProfileDto,files);
        return updatedVictim;
    }

    @GetMapping("/getOffendersDetails/{officerId}")
    public List<OffenderDto> fetchOffenders(@PathVariable("officerId") String officerId) {
        List<OffenderDto> offenderListDtos = this.cmsService.fetchAllOffender(officerId);
        return offenderListDtos;
    }

    @GetMapping("/getSingleOffender/{offenderId}")
    public OffenderDto getSingleOffender(@PathVariable("offenderId") String offenderId) {
        OffenderDto offenderDto = this.cmsService.fetchSingleOffender(offenderId);
        return offenderDto;
    }

    @PutMapping("/updateOffnderProfile/{offenderId}")
    public OffenderDto updateOffenderProfile(@PathVariable("offenderId") String offenderId, @RequestParam("offenderDto") String offenderDtoJson, @RequestParam(value = "files",required = false) MultipartFile[] files) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        OffenderDto offenderDto = objectMapper.readValue(offenderDtoJson, OffenderDto.class);
        OffenderDto updateOffender = this.cmsService.updateOffenderProfile(offenderId, offenderDto,files);
        return updateOffender;

    }

    @PostMapping("/saveHelpAndSupport")
    public ResponseEntity<?> saveHelpAndSupport(@RequestPart("helpAndSupportDto") String helpAndSupportDtoJson, @RequestParam(value = "issueImage",required = false) MultipartFile issueImage){
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            HelpAndSupportDto savedHelpAndSupportDto = objectMapper.readValue(helpAndSupportDtoJson, HelpAndSupportDto.class);
            return ResponseEntity.ok(cmsService.saveHelpAndSupport(savedHelpAndSupportDto,issueImage));
        }catch (Exception e){
            log.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
        }
    }

    // get List of Help and support with required field mapped with OfficerHelpAndSupportDto
    @GetMapping("/getAllHelpAndSupportWithOfficer/{officerId}")
    public ResponseEntity<?> getAllHelpAndSupportWithOfficerName(@PathVariable("officerId") String officerId){
        try {
            return ResponseEntity.ok(cmsService.getAllHelpAndSupportWithOfficerName(officerId));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/getByUuid/{uuid}")
    public ResponseEntity<?> getHelpAndServiceByUuid(@PathVariable("uuid") String uuid){
        try {
            return ResponseEntity.ok(cmsService.getHelpAndServiceByUuid(uuid));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/getAllHelpAndSupport")
    public ResponseEntity<?> getAllHelpAndSupport(){
        try {
            return ResponseEntity.ok(cmsService.getAllHelpAndSupport());
        }catch (Exception e){
            log.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/updateHelpAndSupportByUuid/{uuid}")
    public ResponseEntity<?> updateHelpAndSupportByUuid(@PathVariable("uuid") String uuid, @RequestPart("helpAndSupportDto") String helpAndSupportDtoJson, @RequestParam(value = "issueImage",required = false) MultipartFile file){
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            HelpAndSupportDto helpAndSupportDto = objectMapper.readValue(helpAndSupportDtoJson, HelpAndSupportDto.class);

            HelpAndSupportDto updatedHelpAndSupport = cmsService.updateHelpAndSupportByUuid(uuid,helpAndSupportDto, file);
            return ResponseEntity.ok(updatedHelpAndSupport);
        }catch (Exception e){
            log.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/deleteByUuid/{uuid}")
    public ResponseEntity<?> deleteByUuid(@PathVariable("uuid") String uuid){
        try {
            boolean isDeleted = cmsService.deleteByUuid(uuid);
            if (isDeleted)
                return ResponseEntity.ok("Help and support data deleted.");
            else
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }catch (Exception e){
            log.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> saveFeedback(@RequestBody FeedbackDto feedbackDto){

        boolean isFeedbackSaved = cmsService.saveFeedback(feedbackDto);

        if(isFeedbackSaved)
            return ResponseEntity.ok(true);
        else
            return ResponseEntity.internalServerError().build();
    }

    @GetMapping("/feedbackList")
    public ResponseEntity<?> getListOfFeedbacks(){
        List<FeedbackDto> feedbackDtoList = cmsService.getListOfFeedback();

        return ResponseEntity.ok(feedbackDtoList);
    }

    @PostMapping("/addFIR")
    public ResponseEntity<?> addFIR(@RequestPart("victimId") String victimId, @RequestPart("firDetails") String firDetails, @RequestParam(value = "fir",required = false) MultipartFile fir) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> firDetailsMap = objectMapper.readValue(firDetails, new TypeReference<Map<String, String>>() {
        });

        boolean isFirFiled = cmsService.caseFile(victimId, firDetailsMap, fir);

        if (isFirFiled)
            return ResponseEntity.ok(true);
        else
            return ResponseEntity.internalServerError().build();
    }

    @GetMapping("/fetchVictimDto/{victimId}")
    public VictimDto getSingleVictimDto(@PathVariable("victimId") String victimId) {
        VictimDto victimDto = this.cmsService.fetchSingleVictimDto(victimId);
        return victimDto;
    }


    @PutMapping("/updateStatement/{victimId}")
    public ResponseEntity<VictimDto> updateVictimDto(
            @PathVariable("victimId") String victimId,
            @RequestPart("victimDto") String victimDtoJson,
            @RequestParam(value = "victimFiles",required = false) MultipartFile[] victimFiles,
            @RequestParam(value = "offenderFiles",required = false) MultipartFile[] offenderFiles
    ) {
        VictimDto updateVictim;
        try {
            ObjectMapper ob = new ObjectMapper();
            ob.registerModule(new JavaTimeModule());
            VictimDto victimDto = ob.readValue(victimDtoJson, VictimDto.class);
            updateVictim = cmsService.updateVictimDto(victimId, victimDto, victimFiles, offenderFiles);
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(updateVictim);
    }

    @PutMapping("/caseReopen/{victimId}")
    public VictimDto caseReopen(@PathVariable("victimId") String victimId) {
        VictimDto victimDto = this.cmsService.caseReopen(victimId);
        if (victimId == null) {
            throw new IllegalArgumentException("Victim is not present");
        }
        return victimDto;
    }

    @PostMapping("transfer/{victimId}/{officerId}")
    public ResponseEntity<?> caseTransfer(@PathVariable("victimId") String victimId, @PathVariable("officerId") String officerId, @RequestBody Map<String, String> transferData) {
        if (victimId == null && officerId == null) {
            throw new IllegalArgumentException("victimId and officerId is not present");
        }
        boolean transfer = this.cmsService.caseTransfer(victimId, officerId, transferData.get("officerEmail"));
        if (transfer) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to transfer case.");
        }
    }

    @PostMapping("/{victimId}/witnesses")
    public ResponseEntity<?> addWitnesses(@PathVariable("victimId") String victimId,
                                          @RequestPart(value = "witnessDtosJson", required = false) String witnessDtosJson,
                                          @RequestPart(value = "witnessDtoJson", required = false) String witnessDtoJson,
                                          @RequestParam(value = "files",required = false) MultipartFile[] files) {

        try {
            List<WitnessDto> addedWitnesses = new ArrayList<>();

            if (witnessDtosJson != null && !witnessDtosJson.isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                List<WitnessDto> witnessDtos = objectMapper.readValue(witnessDtosJson, new TypeReference<List<WitnessDto>>() {});
                addedWitnesses.addAll(cmsService.addWitness(witnessDtos, victimId, files));
            }

            if (witnessDtoJson != null && !witnessDtoJson.isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                WitnessDto witnessDto = objectMapper.readValue(witnessDtoJson, WitnessDto.class);
                addedWitnesses.addAll(cmsService.addWitness(Collections.singletonList(witnessDto), victimId, files));
            }

            return ResponseEntity.ok(addedWitnesses);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/getWitnesses/{victimId}")
    public List<WitnessDto> getWitnesses(@PathVariable("victimId") String victimId){
        return this.cmsService.getAllList(victimId);
    }

    @GetMapping("/singleWitness/{witnessId}")
    public WitnessDto singleWitness(@PathVariable("witnessId") String witnessId){
        WitnessDto witnessDto=cmsService.getSingleWitness(witnessId);
        return witnessDto;
    }

    @DeleteMapping("/{witnessId}")
    public ResponseEntity<Void> deleteWitness(@PathVariable("witnessId") String witnessId) {
        try {
            cmsService.deleteWitness(witnessId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/updateWitness/{witnessId}")
    public WitnessDto updateWitness(@PathVariable("witnessId") String witnessId,
                                    @RequestPart("witnessDto") String witnessDtoJson,
                                    @RequestParam(value = "files",required = false) MultipartFile[] files) throws IOException {
        try {
            ObjectMapper ob = new ObjectMapper();
            ob.registerModule(new JavaTimeModule());
            WitnessDto witnessDto= ob.readValue(witnessDtoJson, WitnessDto.class);
            WitnessDto updatedWitness = cmsService.updateWitness(witnessId,witnessDto,files);
            return updatedWitness;
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/addferrist/{victimId}")
    public ResponseEntity<?> saveFerrist(@PathVariable("victimId") String victimId,@RequestPart("ferristDto") String ferristDtoJson,@RequestParam(value = "file",required = false) MultipartFile[] file){
        try{
            ObjectMapper objectMapper=new ObjectMapper();
            List<FerristDto> ferristDtos=objectMapper.readValue(ferristDtoJson, new TypeReference<List<FerristDto>>() {});

            List<FerristDto> addFerrist=cmsService.addFerrist(victimId,ferristDtos,file);
            return ResponseEntity.ok(addFerrist);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/fetchAllFerrist/{victimId}")
    public List<FerristDto> getAllFerrist(@PathVariable("victimId") String victimId){
        return cmsService.fetchAllFerrist(victimId);
    }

    @GetMapping("/singleFerrist/{ferristId}")
    public FerristDto getSingleFerrist(@PathVariable("ferristId") String ferristId){
        FerristDto ferristDto=cmsService.fetchSingleFerrist(ferristId);
        return ferristDto;
    }
    @PutMapping("/updateFerrist/{ferristId}")
    public FerristDto updateFerrist(@PathVariable("ferristId") String ferristId,
                                    @RequestPart("ferristDto") String ferristDtoJson,
                                    @RequestParam(value = "file",required = false) MultipartFile[] files) throws IOException {
        try {
            ObjectMapper ob = new ObjectMapper();
            ob.registerModule(new JavaTimeModule());
            FerristDto ferristDto= ob.readValue(ferristDtoJson, FerristDto.class);
            FerristDto updatedferrist = cmsService.updateFerrist(ferristId,ferristDto,files);
            return updatedferrist;
        } catch (JsonMappingException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/fetchAllFerristFiles/{victimId}")
    public List<FileEntity> getAllFerristFiles(@PathVariable("victimId") String victimId){
        return cmsService.fetchFerristFiles(victimId);
    }

    @DeleteMapping("/deleteFerrist/{victimId}/{ferristId}")
    public void deleteSingleFerrist(@PathVariable("ferristId") String ferristId,@PathVariable("victimId") String victimId){
        cmsService.deleteFerrist(ferristId,victimId);
    }

    @PutMapping("/enableOrDisableOfficer/{officerId}/{status}")
    public ResponseEntity<Boolean> enableOrDisableOfficer(
            @PathVariable("officerId") String officerId,
            @PathVariable("status") String status) {

        if (!status.equals(Constants.ENABLED) && !status.equals(Constants.DISABLED)) {
            return ResponseEntity.badRequest().body(false);
        }
        Boolean result = cmsService.enableOrDisableOfficer(officerId, status);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false);
        }
        return ResponseEntity.ok(result);
    }
}