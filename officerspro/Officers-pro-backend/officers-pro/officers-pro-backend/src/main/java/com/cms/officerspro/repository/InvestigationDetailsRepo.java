package com.cms.officerspro.repository;

import com.cms.officerspro.entity.InvestigationDetails;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestigationDetailsRepo extends JpaRepository<InvestigationDetails,String>{

    @Query(value = "SELECT * FROM investigation_details i WHERE i.victim_id = :victimId",nativeQuery = true)
    List<InvestigationDetails> findByVictimId(@Param("victimId") String victimId);

    @Transactional
    @Modifying
    @Query(value = "UPDATE Investigation_Details i SET i.investigation_details_list_officer_id = null WHERE i.investigation_details_list_officer_id = :officerId",nativeQuery = true)
    void updateOfficerIdToNullByOfficerId(@Param("officerId") String officerId);
}
