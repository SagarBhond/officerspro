package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.Panchnama;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PanchnamaRepository extends JpaRepository<Panchnama, Integer> {

    @Query("SELECT p FROM Panchnama p WHERE " +
           "LOWER(p.panchnamaText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.witness1Name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.witness2Name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Panchnama> searchPanchnamas(@Param("keyword") String keyword, Pageable pageable);

    List<Panchnama> findByEvidenceId(Integer evidenceId);
    List<Panchnama> findByPanchnamaDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM Panchnama p WHERE " +
           "(:evidenceId IS NULL OR p.evidenceId = :evidenceId) AND " +
           "(:startDate IS NULL OR p.panchnamaDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.panchnamaDate <= :endDate)")
    Page<Panchnama> findAllWithFilters(
        @Param("evidenceId") Integer evidenceId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
