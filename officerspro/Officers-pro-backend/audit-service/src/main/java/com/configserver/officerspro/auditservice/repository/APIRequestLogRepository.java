package com.configserver.officerspro.auditservice.repository;

import com.configserver.officerspro.auditservice.entity.APIRequestLog;
import com.configserver.officerspro.auditservice.enums.HttpMethodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface APIRequestLogRepository extends JpaRepository<APIRequestLog, Long> {

    List<APIRequestLog> findByUserId(Long userId);

    List<APIRequestLog> findByEndpointUrl(String endpointUrl);

    List<APIRequestLog> findByHttpMethod(HttpMethodType httpMethod);

    List<APIRequestLog> findByRequestTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<APIRequestLog> findByResponseCode(Integer responseCode);

    List<APIRequestLog> findByIpAddress(String ipAddress);

    List<APIRequestLog> findByUserIdAndRequestTimeBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
