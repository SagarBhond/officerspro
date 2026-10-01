package com.cms.officerspro.mapper;

import com.cms.officerspro.dto.*;
import com.cms.officerspro.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EntityMapper {

    Offender mapToOffender(OffenderDto offenderDto);
    OffenderDto mapToOffenderDto(Offender offender);


    CrimeDetails mapToCrimeDetails(CrimeDetailsDto crimeDetailsDto);
    CrimeDetailsDto mapToCrimeDetailsDto(CrimeDetails crimeDetails);


    Victim mapToVictim(VictimDto victimDto);
    VictimDto mapToVictimDto(Victim victim);


    InvestigationDetails mapToInvestigationDetails(InvestigationDetailsDto investigationDetailsDto);
    InvestigationDetailsDto mapToInvestigationDetailsDto(InvestigationDetails investigationDetails);


    List<InvestigationDetails> mapToInvestigationDetailsList(List<InvestigationDetailsDto> investigationDetailsDtoList);
    List<InvestigationDetailsDto> mapToInvestigationDetailsDtoList(List<InvestigationDetails> investigationDetailsList);


    Officer mapToOfficer(OfficerDto officerDto);
    OfficerDto mapToOfficerDto(Officer officer);

    OfficerListDto mapToOfficerListDto(Officer officer);

    VictimListDto mapToVictimListDto(Victim victim);

    Victim mapToVictim(VictimProfileDto victimProfileDto);
    VictimProfileDto mapToVictimProfileDto(Victim victim);


    @Mapping(target = "investId",ignore= true)
    @Mapping(target = "victim",ignore = true)
    InvestigationDetails cloneInvestigation(InvestigationDetails original);

    @Mapping(target = "victimId", ignore = true) // Ignore mapping victimId to generate a new ID
    @Mapping(target = "offenderList", ignore = true)
    @Mapping(target = "aadharFile.fileId", ignore = true)
    @Mapping(target = "panFile.fileId", ignore = true)
    @Mapping(target = "passportFile.fileId", ignore = true)
    Victim cloneVictim(Victim original);

    @Mapping(target = "offenderId", ignore = true) // Ignore mapping offenderId to generate new IDs
    @Mapping(target = "aadharFile.fileId", ignore = true)
    @Mapping(target = "panFile.fileId", ignore = true)
    @Mapping(target = "passportFile.fileId", ignore = true)
    Offender cloneOffender(Offender original);

    @Mapping(target = "crimeId", ignore = true) // Ignore mapping crimeId to generate new IDs
    CrimeDetails cloneCrimeDetails(CrimeDetails original);

    HelpAndSupport mapToHelpAndSupport(HelpAndSupportDto helpAndSupportDto);
    HelpAndSupportDto mapToHelpAndSupportDto(HelpAndSupport helpAndSupport);


    Feedback mapToFeedback(FeedbackDto feedbackDto);
    FeedbackDto mapToFeedbackDto(Feedback feedback);


    Witness mapToWitness(WitnessDto witnessDto);
    WitnessDto mapToWitnessDto(Witness witness);

    Ferrist mapToFerrist(FerristDto ferristDto);
    FerristDto mapToFerristDto(Ferrist ferrist);
}
