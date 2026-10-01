package com.cms.officerspro.repository;


import com.cms.officerspro.entity.FileEntity;
import com.cms.officerspro.entity.Victim;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VictimRepo extends JpaRepository<Victim,String> {


    @Query(value = "SELECT case_status, COUNT(*) FROM victims GROUP BY case_status;", nativeQuery = true)
    List<Object[]> findAllCaseStatusCounts();

    @Query(value = "SELECT v.victim_id, v.victim_name, v.fir_no, v.case_status," +
            " DATE_FORMAT(v.created_on, '%Y-%m-%d %H:%i:%s') AS created_on," +
            " GROUP_CONCAT(o.offender_name SEPARATOR ', ') AS offender_names," +
            " GROUP_CONCAT(o.section_id SEPARATOR ', ') AS section_ids," +
            " v.short_description, v.victim_list_officer_id FROM victims v" +
            " LEFT JOIN offenders o ON v.victim_id = o.offender_list_victim_id"+
            " GROUP BY v.victim_id, v.victim_name, v.fir_no, v.case_status, created_on;", nativeQuery = true)
    List<Object[]> findVictimNamesOffendersNamesCaseStatusesShortDesFirNoSectionIdAndCreatedOns();

    @Query(value = "SELECT victim_list_officer_id from victims where victim_id = :victimId", nativeQuery = true)
    String findOfficerId(@Param("victimId") String victimId);


    @Query("SELECT f FROM Victim v JOIN v.aadharFile f WHERE v.victimId = :victimId " +
            "UNION SELECT f FROM Victim v JOIN v.panFile f WHERE v.victimId = :victimId " +
            "UNION SELECT f FROM Victim v JOIN v.passportFile f WHERE v.victimId = :victimId")
    List<FileEntity> findFilesByVictimId(@Param("victimId") String victimId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Victims v SET v.victim_list_officer_id = null WHERE v.victim_list_officer_id = :officerId", nativeQuery = true)
    void updateOfficerIdToNull(@Param("officerId") String officerId);


    @Modifying
    @Transactional
    @Query(value = "SELECT v.*, o.officer_id AS officer_id_alias FROM victims v JOIN officers o ON v.victim_list_officer_id = o.officer_id WHERE o.officer_id = :officerId", nativeQuery = true)
    List<Victim> findByOfficerId(@Param("officerId") String officerId);

}