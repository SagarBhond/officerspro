package com.configserver.officerspro.complainandfirservice.mapper;

import com.configserver.officerspro.complainandfirservice.dto.ComplaintParticipantDTO;
import com.configserver.officerspro.complainandfirservice.entity.Citizen;
import com.configserver.officerspro.complainandfirservice.entity.ComplaintParticipant;
import com.configserver.officerspro.complainandfirservice.enums.ParticipantRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.Optional;

@Mapper(componentModel = "spring")
public interface EntityMapper {

    @Mapping(target = "aadharPath", ignore = true)
    @Mapping(target = "panPath", ignore = true)
    @Mapping(target = "photoPath", ignore = true)
    Citizen toCitizen(ComplaintParticipantDTO dto);

    default Citizen mapToCitizen(ComplaintParticipantDTO dto) {
        return Optional.ofNullable(dto)
                .map(d -> Citizen.builder()
                        .name(Optional.ofNullable(d.getName()).orElse(""))
                        .contactNo(Optional.ofNullable(d.getContactNo()).orElse(""))
                        .address(Optional.ofNullable(d.getAddress()).orElse(""))
                        .aadharNo(d.getAadharNo())
                        .email(d.getEmail())
                        .gender(d.getGender())
                        .age(Optional.ofNullable(d.getAge()).filter(age -> age > 0).orElse(null))
                        .profession(d.getProfession())
                        .photoPath("")
                        .panPath("")
                        .aadharPath("")
                        .createdBy(d.getCreatedBy())
                        .createdOn(Optional.ofNullable(d.getCreatedOn()).orElse(LocalDateTime.now()))
                        .updatedBy(d.getUpdatedBy())
                        .updatedOn(d.getUpdatedOn())
                        .build())
                .orElse(null);
    }

    default ComplaintParticipant mapToParticipant(
            Citizen citizen,
            ParticipantRole role,
            ComplaintParticipantDTO dto,
            Integer createdBy
    ) {
        return Optional.ofNullable(citizen)
                .map(c -> ComplaintParticipant.builder()
                        .citizen(c)
                        .role(role)
                        .createdBy(createdBy)
                        .createdOn(LocalDateTime.now())
                        .updatedBy(dto.getUpdatedBy())
                        .updatedOn(dto.getUpdatedOn())
                        .build())
                .orElse(null);
    }

    default ComplaintParticipantDTO mapToParticipantDTO(ComplaintParticipant participant) {
        return Optional.ofNullable(participant)
                .filter(p -> p.getCitizen() != null)
                .map(p -> {
                    ComplaintParticipantDTO dto = new ComplaintParticipantDTO();
                    dto.setComplaintParticipantId(p.getComplaintParticipantId());
                    dto.setComplaintId(Optional.ofNullable(p.getComplaint()).map(complaint -> complaint.getComplaintId()).orElse(null));
                    dto.setCitizenId(p.getCitizen().getCitizenId());
                    dto.setRole(p.getRole());
                    dto.setName(p.getCitizen().getName());
                    dto.setContactNo(p.getCitizen().getContactNo());
                    dto.setAddress(p.getCitizen().getAddress());
                    dto.setAadharNo(p.getCitizen().getAadharNo());
                    dto.setEmail(p.getCitizen().getEmail());
                    dto.setGender(p.getCitizen().getGender());
                    dto.setAge(p.getCitizen().getAge());
                    dto.setProfession(p.getCitizen().getProfession());

                    // Add audit fields
                    dto.setCreatedBy(p.getCreatedBy());
                    dto.setCreatedOn(p.getCreatedOn());
                    dto.setUpdatedBy(p.getUpdatedBy());
                    dto.setUpdatedOn(p.getUpdatedOn());

                    return dto;
                })
                .orElse(null);
    }
}

