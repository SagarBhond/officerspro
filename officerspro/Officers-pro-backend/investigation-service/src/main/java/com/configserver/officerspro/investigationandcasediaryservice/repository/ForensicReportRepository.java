package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.ForensicReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ForensicReportRepository extends JpaRepository<ForensicReport, Integer> {

    @Query("SELECT f FROM ForensicReport f WHERE " +
           "LOWER(f.reportText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.labName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.expertName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ForensicReport> searchForensicReports(@Param("keyword") String keyword, Pageable pageable);

    List<ForensicReport> findByEvidenceId(Integer evidenceId);
    List<ForensicReport> findByLabName(String labName);
    List<ForensicReport> findByReportDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT f FROM ForensicReport f WHERE " +
           "(:evidenceId IS NULL OR f.evidenceId = :evidenceId) AND " +
           "(:labName IS NULL OR f.labName = :labName) AND " +
           "(:startDate IS NULL OR f.reportDate >= :startDate) AND " +
           "(:endDate IS NULL OR f.reportDate <= :endDate)")
    Page<ForensicReport> findAllWithFilters(
        @Param("evidenceId") Integer evidenceId,
        @Param("labName") String labName,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
