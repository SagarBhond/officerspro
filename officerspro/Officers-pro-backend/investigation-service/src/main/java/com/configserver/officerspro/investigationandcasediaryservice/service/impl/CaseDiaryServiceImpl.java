package com.configserver.officerspro.investigationandcasediaryservice.service.impl;

import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryDTO;
import com.configserver.officerspro.investigationandcasediaryservice.dto.CaseDiaryRequestDTO;
import com.configserver.officerspro.investigationandcasediaryservice.entity.CaseDiary;
import com.configserver.officerspro.investigationandcasediaryservice.exception.CaseDiaryNotFoundException;
import com.configserver.officerspro.investigationandcasediaryservice.exception.CaseDiarySaveException;
import com.configserver.officerspro.investigationandcasediaryservice.repository.CaseDiaryRepository;
import com.configserver.officerspro.investigationandcasediaryservice.service.CaseDiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CaseDiaryServiceImpl implements CaseDiaryService {

    @Autowired
    private CaseDiaryRepository caseDiaryRepository;

    @Override
    public CaseDiaryDTO createCaseDiary(CaseDiaryRequestDTO requestDTO) {
        return Optional.of(requestDTO)
                .map(this::mapRequestToEntity)
                .map(caseDiaryRepository::save)
                .map(this::mapToDTO)
                .orElseThrow(() -> new CaseDiarySaveException("Failed to create case diary"));
    }

    @Override
    public CaseDiaryDTO getCaseDiaryById(Integer diaryId) {
        return caseDiaryRepository.findById(diaryId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new CaseDiaryNotFoundException("Case diary not found with id: " + diaryId));
    }

    @Override
    public List<CaseDiaryDTO> getCaseDiariesByInvestigationId(String investigationId) {
        return caseDiaryRepository.findByInvestigationId(investigationId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<CaseDiaryDTO> searchCaseDiaries(String keyword, Pageable pageable) {
        return caseDiaryRepository.searchCaseDiaries(keyword, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public Page<CaseDiaryDTO> getAllCaseDiariesWithFilters(
            String investigationId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        return caseDiaryRepository.findAllWithFilters(
                investigationId, startDate, endDate, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public CaseDiaryDTO updateCaseDiary(Integer diaryId, CaseDiaryRequestDTO requestDTO) {
        return caseDiaryRepository.findById(diaryId)
                .map(existing -> updateEntityFromRequest(existing, requestDTO))
                .map(caseDiaryRepository::save)
                .map(this::mapToDTO)
                .orElseThrow(() -> new CaseDiaryNotFoundException("Case diary not found with id: " + diaryId));
    }

    @Override
    public void deleteCaseDiary(Integer diaryId) {
        if (!caseDiaryRepository.existsById(diaryId)) {
            throw new CaseDiaryNotFoundException("Case diary not found with id: " + diaryId);
        }
        caseDiaryRepository.deleteById(diaryId);
    }

    @Override
    public long countByInvestigationId(String investigationId) {
        return caseDiaryRepository.countByInvestigationId(investigationId);
    }

    private CaseDiary mapRequestToEntity(CaseDiaryRequestDTO requestDTO) {
        return CaseDiary.builder()
                .investigationId(requestDTO.getInvestigationId())
                .entryDate(requestDTO.getEntryDate() != null ?
                    requestDTO.getEntryDate() : LocalDateTime.now())
                .entryText(requestDTO.getEntryText())
                .createdBy(1) // TODO: Get from security context
                .createdOn(LocalDateTime.now())
                .build();
    }

    private CaseDiary updateEntityFromRequest(CaseDiary existing, CaseDiaryRequestDTO requestDTO) {
        return existing.toBuilder()
                .entryText(requestDTO.getEntryText() != null ?
                    requestDTO.getEntryText() : existing.getEntryText())
                .entryDate(requestDTO.getEntryDate() != null ?
                    requestDTO.getEntryDate() : existing.getEntryDate())
                .updatedBy(1) // TODO: Get from security context
                .updatedOn(LocalDateTime.now())
                .build();
    }

    private CaseDiaryDTO mapToDTO(CaseDiary caseDiary) {
        return CaseDiaryDTO.builder()
                .diaryId(caseDiary.getDiaryId())
                .investigationId(caseDiary.getInvestigationId())
                .entryDate(caseDiary.getEntryDate())
                .entryText(caseDiary.getEntryText())
                .createdBy(caseDiary.getCreatedBy())
                .createdOn(caseDiary.getCreatedOn())
                .updatedBy(caseDiary.getUpdatedBy())
                .updatedOn(caseDiary.getUpdatedOn())
                .build();
    }
}
