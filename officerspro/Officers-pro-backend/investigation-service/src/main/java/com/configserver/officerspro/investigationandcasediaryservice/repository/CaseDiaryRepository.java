package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.CaseDiary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CaseDiaryRepository extends JpaRepository<CaseDiary, Integer> {

    @Query("SELECT cd FROM CaseDiary cd WHERE " +
           "LOWER(cd.entryText) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<CaseDiary> searchCaseDiaries(@Param("keyword") String keyword, Pageable pageable);

    List<CaseDiary> findByInvestigationId(String investigationId);
    long countByInvestigationId(String investigationId);

    @Query("SELECT cd FROM CaseDiary cd WHERE " +
           "(:investigationId IS NULL OR cd.investigationId = :investigationId) AND " +
           "(CAST(:startDate AS date) IS NULL OR cd.entryDate >= :startDate) AND " +
           "(CAST(:endDate AS date) IS NULL OR cd.entryDate <= :endDate)")
    Page<CaseDiary> findAllWithFilters(
        @Param("investigationId") String investigationId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
