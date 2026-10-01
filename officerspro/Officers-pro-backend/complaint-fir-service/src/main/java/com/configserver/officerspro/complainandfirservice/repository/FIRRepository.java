package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.FIR;
import com.configserver.officerspro.complainandfirservice.enums.FIRStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FIRRepository extends JpaRepository<FIR, String> {
    
    @Query("SELECT f FROM FIR f WHERE " +
           "LOWER(f.complaint.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.status) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<FIR> searchFIRs(@Param("keyword") String keyword, Pageable pageable);
    
    @Modifying
    @Query("UPDATE FIR f SET f.status = :status, f.updatedOn = CURRENT_TIMESTAMP WHERE f.firId = :firId")
    void updateStatus(@Param("firId") String firId, @Param("status") FIRStatus status);
    
    @Modifying
    @Query("UPDATE FIR f SET f.status = :status, f.updatedOn = CURRENT_TIMESTAMP WHERE f.complaint.complaintId = :complaintId")
    void updateStatusByComplaintId(@Param("complaintId") String complaintId, @Param("status") FIRStatus status);
    
    FIR findFirstByComplaint_ComplaintId(String complaintId);
    List<FIR> findByOfficerId(Integer officerId);
    List<FIR> findByStatus(FIRStatus status);
    long countByStatus(FIRStatus status);
    long countByRegisteredOnAfter(LocalDateTime date);

    boolean existsByComplaint_ComplaintId(String complaintId);
    
    @Query("SELECT f FROM FIR f WHERE " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:officerId IS NULL OR f.officerId = :officerId) AND " +
           "(CAST(:startDate AS date) IS NULL OR f.registeredOn >= :startDate) AND " +
           "(CAST(:endDate AS date) IS NULL OR f.registeredOn <= :endDate)")
    Page<FIR> findAllWithFilters(
        @Param("status") FIRStatus status,
        @Param("officerId") Integer officerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
