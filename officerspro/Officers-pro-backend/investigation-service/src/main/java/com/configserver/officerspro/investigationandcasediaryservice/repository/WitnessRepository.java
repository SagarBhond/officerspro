package com.configserver.officerspro.investigationandcasediaryservice.repository;

import com.configserver.officerspro.investigationandcasediaryservice.entity.Witness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WitnessRepository extends JpaRepository<Witness, Integer> {

    List<Witness> findByInvestigationId(Integer investigationId);

    @Query("SELECT w FROM Witness w WHERE " +
           "LOWER(w.witnessName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.witnessAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.witnessType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Witness> searchWitnesses(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT w FROM Witness w WHERE w.investigationId = :investigationId")
    List<Witness> findByInvestigationIdForPanchnama(@Param("investigationId") Integer investigationId);

    long countByInvestigationId(Integer investigationId);
}
