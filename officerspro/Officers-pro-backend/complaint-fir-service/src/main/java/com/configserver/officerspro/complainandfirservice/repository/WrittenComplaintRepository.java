package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.WrittenComplaint;
import com.configserver.officerspro.complainandfirservice.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WrittenComplaintRepository extends JpaRepository<WrittenComplaint, String> {
    
    List<WrittenComplaint> findByStatus(ComplaintStatus status);
    List<WrittenComplaint> findByCreatedBy(Integer createdBy);
    List<WrittenComplaint> findByFiledByStationId(Integer stationId);

    @Query("SELECT wc FROM WrittenComplaint wc LEFT JOIN FETCH wc.participants WHERE " +
           "(:status IS NULL OR wc.status = :status) AND " +
           "(:createdBy IS NULL OR wc.createdBy = :createdBy) AND " +
           "(:stationId IS NULL OR wc.filedByStationId = :stationId) AND " +
           "(CAST(:startDate AS date) IS NULL OR wc.filedDate >= :startDate) AND " +
           "(CAST(:endDate AS date) IS NULL OR wc.filedDate <= :endDate)")
    Page<WrittenComplaint> findAllWithFilters(
        @Param("status") ComplaintStatus status,
        @Param("createdBy") Integer createdBy,
        @Param("stationId") Integer stationId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT wc FROM WrittenComplaint wc LEFT JOIN FETCH wc.participants p LEFT JOIN FETCH p.citizen WHERE wc.complaintId = :complaintId")
    Optional<WrittenComplaint> findByIdWithParticipants(@Param("complaintId") String complaintId);
}
