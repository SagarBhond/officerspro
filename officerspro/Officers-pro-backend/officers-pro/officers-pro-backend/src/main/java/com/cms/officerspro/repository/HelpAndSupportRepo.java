package com.cms.officerspro.repository;

import com.cms.officerspro.entity.HelpAndSupport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpAndSupportRepo extends JpaRepository<HelpAndSupport,Integer> {

    HelpAndSupport findByUuid(String uuid);

    @Query(value = "select * from help_and_support where officer_id = :officerId",nativeQuery = true)
    List<HelpAndSupport> findByOfficer(@Param("officerId") String officerId);
}
