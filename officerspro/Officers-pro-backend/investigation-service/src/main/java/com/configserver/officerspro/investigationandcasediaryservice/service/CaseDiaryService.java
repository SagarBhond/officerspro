package com.configserver.officerspro.investigationandcasediaryservice.service;

import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface CaseDiaryService {

    CaseDiaryDTO createCaseDiary(CaseDiaryRequestDTO requestDTO);

    CaseDiaryDTO getCaseDiaryById(Integer diaryId);

    List<CaseDiaryDTO> getCaseDiariesByInvestigationId(String investigationId);

    Page<CaseDiaryDTO> searchCaseDiaries(String keyword, Pageable pageable);

    Page<CaseDiaryDTO> getAllCaseDiariesWithFilters(
            String investigationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    CaseDiaryDTO updateCaseDiary(Integer diaryId, CaseDiaryRequestDTO requestDTO);

    void deleteCaseDiary(Integer diaryId);

    long countByInvestigationId(String investigationId);
}
