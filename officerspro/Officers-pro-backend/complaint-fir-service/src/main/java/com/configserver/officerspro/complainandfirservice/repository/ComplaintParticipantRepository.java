package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.ComplaintParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ComplaintParticipantRepository extends JpaRepository<ComplaintParticipant, Integer> {
    
    List<ComplaintParticipant> findByComplaintComplaintId(String complaintId);
    
    @Query("SELECT cp FROM ComplaintParticipant cp WHERE cp.complaint.complaintId = :complaintId")
    List<ComplaintParticipant> findParticipantsByComplaintId(@Param("complaintId") String complaintId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ComplaintParticipant cp WHERE cp.complaint.complaintId = :complaintId")
    void deleteByComplaintId(@Param("complaintId") String complaintId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ComplaintParticipant cp WHERE cp.complaint.complaintId = :complaintId")
    void deleteByComplaintComplaintId(@Param("complaintId") String complaintId);
    
    @Query("SELECT cp FROM ComplaintParticipant cp WHERE cp.complaint.complaintId = :complaintId AND cp.role = 'COMPLAINANT'")
    Optional<ComplaintParticipant> findComplainantByComplaintId(@Param("complaintId") String complaintId);
}
