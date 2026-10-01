package com.configserver.officerspro.auditservice.mapper;

import com.configserver.officerspro.auditservice.dto.APIRequestLogDTO;
import com.configserver.officerspro.auditservice.dto.APIRequestLogRequestDTO;
import com.configserver.officerspro.auditservice.entity.APIRequestLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface APIRequestLogMapper {

    APIRequestLogDTO toDTO(APIRequestLog apiRequestLog);

    List<APIRequestLogDTO> toDTOList(List<APIRequestLog> apiRequestLogs);

    @Mapping(target = "requestId", ignore = true)
    @Mapping(target = "requestTime", ignore = true)
    APIRequestLog toEntity(APIRequestLogRequestDTO requestDTO);
}
