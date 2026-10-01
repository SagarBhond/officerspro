package com.configserver.officerspro.auditservice.mapper;

import com.configserver.officerspro.auditservice.dto.AuditTrailDTO;
import com.configserver.officerspro.auditservice.dto.AuditTrailRequestDTO;
import com.configserver.officerspro.auditservice.entity.AuditTrail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AuditTrailMapper {

    AuditTrailDTO toDTO(AuditTrail auditTrail);

    List<AuditTrailDTO> toDTOList(List<AuditTrail> auditTrails);

    @Mapping(target = "auditId", ignore = true)
    @Mapping(target = "changedOn", ignore = true)
    AuditTrail toEntity(AuditTrailRequestDTO requestDTO);
}
