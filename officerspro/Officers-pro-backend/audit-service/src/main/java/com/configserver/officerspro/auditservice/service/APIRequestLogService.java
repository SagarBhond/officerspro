package com.configserver.officerspro.auditservice.service;

import com.configserver.officerspro.auditservice.dto.APIRequestLogDTO;
import com.configserver.officerspro.auditservice.dto.APIRequestLogRequestDTO;
import com.configserver.officerspro.auditservice.entity.APIRequestLog;
import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import com.configserver.officerspro.auditservice.mapper.APIRequestLogMapper;
import com.configserver.officerspro.auditservice.repository.APIRequestLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class APIRequestLogService {

    private final APIRequestLogRepository apiRequestLogRepository;
    private final APIRequestLogMapper apiRequestLogMapper;

    public APIRequestLogDTO createAPIRequestLog(APIRequestLogRequestDTO requestDTO) {
        log.info("Creating API request log for endpoint: {}, method: {}, userId: {}",
                requestDTO.getEndpointUrl(), requestDTO.getHttpMethod(), requestDTO.getUserId());

        APIRequestLog apiRequestLog = apiRequestLogMapper.toEntity(requestDTO);
        APIRequestLog savedLog = apiRequestLogRepository.save(apiRequestLog);

        log.info("API request log created with ID: {}", savedLog.getRequestId());
        return apiRequestLogMapper.toDTO(savedLog);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAllAPIRequestLogs() {
        log.info("Fetching all API request logs");
        List<APIRequestLog> logs = apiRequestLogRepository.findAll();
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public APIRequestLogDTO getAPIRequestLogById(Long requestId) {
        log.info("Fetching API request log with ID: {}", requestId);
        APIRequestLog log = apiRequestLogRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("API request log not found with ID: " + requestId));
        return apiRequestLogMapper.toDTO(log);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByUserId(Long userId) {
        log.info("Fetching API request logs for user: {}", userId);
        List<APIRequestLog> logs = apiRequestLogRepository.findByUserId(userId);
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByEndpoint(String endpointUrl) {
        log.info("Fetching API request logs for endpoint: {}", endpointUrl);
        List<APIRequestLog> logs = apiRequestLogRepository.findByEndpointUrl(endpointUrl);
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByHttpMethod(HttpMethodType httpMethod) {
        log.info("Fetching API request logs for HTTP method: {}", httpMethod);
        List<APIRequestLog> logs = apiRequestLogRepository.findByHttpMethod(httpMethod);
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching API request logs between {} and {}", startDate, endDate);
        List<APIRequestLog> logs = apiRequestLogRepository.findByRequestTimeBetween(startDate, endDate);
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByResponseCode(Integer responseCode) {
        log.info("Fetching API request logs for response code: {}", responseCode);
        List<APIRequestLog> logs = apiRequestLogRepository.findByResponseCode(responseCode);
        return apiRequestLogMapper.toDTOList(logs);
    }

    @Transactional(readOnly = true)
    public List<APIRequestLogDTO> getAPIRequestLogsByIpAddress(String ipAddress) {
        log.info("Fetching API request logs for IP address: {}", ipAddress);
        List<APIRequestLog> logs = apiRequestLogRepository.findByIpAddress(ipAddress);
        return apiRequestLogMapper.toDTOList(logs);
    }
}
