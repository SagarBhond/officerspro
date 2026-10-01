package com.cms.officerspro.service;

import com.cms.officerspro.repository.VictimRepo;
import com.cms.officerspro.dto.VictimOffenderDto;
import com.cms.officerspro.mapper.EntityMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service class for managing and retrieving case status and victim-offender details.
 */
@Slf4j
@Service
public class AdminService {

    @Autowired
    private VictimRepo victimRepo;

    @Autowired
    private EntityMapper mapper;

    private Map<String, Long> statusCounts = new HashMap<>();

    /**
     * Refreshes the case status counts from the repository.
     */
    private void refreshCaseCounts() {
        try {
            List<Object[]> caseStatusList = victimRepo.findAllCaseStatusCounts();
            statusCounts.clear();

            for (Object[] result : caseStatusList) {
                if (result.length >= 2 && result[0] instanceof String status && result[1] instanceof Number) {
                    Long count = ((Number) result[1]).longValue();
                    statusCounts.put(status, count);
                } else {
                    log.warn("Unexpected data format in case status list: {}", Arrays.toString(result));
                }
            }
        } catch (Exception e) {
            log.error("Error refreshing case counts", e);
            throw new DataAccessException("Failed to refresh case counts", e);
        }
    }

    /**
     * Retrieves the total number of cases.
     *
     * @return the total number of cases.
     */
    public long getCasesCount() {
        try {
            refreshCaseCounts();
            return statusCounts.values().stream()
                    .mapToLong(Long::longValue)
                    .sum();
        } catch (Exception e) {
            log.error("Error getting total case count", e);
            throw new ServiceException("Failed to get cases count", e);
        }
    }

    /**
     * Retrieves the number of active cases.
     *
     * @return the number of active cases.
     */
    public long getActiveCasesCount() {
        try {
            refreshCaseCounts();
            return statusCounts.getOrDefault("in progress", 0L);
        } catch (Exception e) {
            log.error("Error getting active cases count", e);
            throw new ServiceException("Failed to get active cases count", e);
        }
    }

    /**
     * Retrieves the number of completed cases.
     *
     * @return the number of completed cases.
     */
    public long getCompletedCasesCount() {
        try {
            refreshCaseCounts();
            return statusCounts.getOrDefault("completed", 0L);
        } catch (Exception e) {
            log.error("Error getting completed cases count", e);
            throw new ServiceException("Failed to get completed cases count", e);
        }
    }

    /**
     * Retrieves a list of victim-offender details.
     *
     * @return a list of VictimOffenderDto objects.
     */
    public List<VictimOffenderDto> getListOfCases() {
        try {
            List<Object[]> list = victimRepo.findVictimNamesOffendersNamesCaseStatusesShortDesFirNoSectionIdAndCreatedOns();
            List<VictimOffenderDto> victimOffenderDtoList = new ArrayList<>();

            for (Object[] result : list) {
                if (result.length >= 8) {
                    VictimOffenderDto victimOffenderDto = new VictimOffenderDto(
                            (String) result[0],
                            (String) result[1],
                            (String) result[2],
                            (String) result[3],
                            (String) result[4],
                            (String) result[5],
                            (String) result[6],
                            (String) result[7],
                            (String) result[8]
                    );
                    victimOffenderDtoList.add(victimOffenderDto);
                } else {
                    log.warn("Unexpected data format in victim-offender list: {}", Arrays.toString(result));
                }
            }

            return victimOffenderDtoList;
        } catch (Exception e) {
            log.error("Error retrieving list of cases", e);
            throw new ServiceException("Failed to retrieve list of cases", e);
        }
    }

    /**
     * Counts the number of VictimOffenderDto objects with null FIR number.
     *
     * @return the count of VictimOffenderDto objects with null FIR number.
     */
    public long getAllStatementCount() {
        try {
            List<VictimOffenderDto> victimOffenderDtoList = getListOfCases();
            return victimOffenderDtoList.stream()
                    .filter(victimOffender -> victimOffender.getFirNo() == null)
                    .count();
        } catch (Exception e) {
            log.error("Error counting statements with null FIR numbers", e);
            throw new ServiceException("Failed to count statements with null FIR numbers", e);
        }
    }

    /**
     * Custom exception class for data access errors.
     */
    public static class DataAccessException extends RuntimeException {
        public DataAccessException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Custom exception class for service errors.
     */
    public static class ServiceException extends RuntimeException {
        public ServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
