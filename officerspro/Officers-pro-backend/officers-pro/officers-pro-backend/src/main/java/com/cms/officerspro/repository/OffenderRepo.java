package com.cms.officerspro.repository;

import com.cms.officerspro.entity.FileEntity;
import com.cms.officerspro.entity.Offender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffenderRepo extends JpaRepository<Offender,String> {

    @Query("SELECT f FROM Offender o JOIN o.aadharFile f WHERE o.offenderId = :offenderId " +
            "UNION SELECT f FROM Offender o JOIN o.panFile f WHERE o.offenderId = :offenderId " +
            "UNION SELECT f FROM Offender o JOIN o.passportFile f WHERE o.offenderId = :offenderId")
    List<FileEntity> findFilesByOffenderId(@Param("offenderId") String offenderId);

    @Query(value = "select offender_id from offenders where offender_list_victim_id = :victimId",nativeQuery = true)
    List<String> findOffenderId(@Param("victimId") String victimId);

    @Query(value = "SELECT o.* FROM offenders o JOIN victims v ON o.offender_list_victim_id = v.victim_id JOIN officers o2 ON v.victim_list_officer_id = o2.officer_id WHERE o2.officer_id = :officerId", nativeQuery = true)
    List<Offender> findByOfficerId(@Param("officerId") String officerId);

}
