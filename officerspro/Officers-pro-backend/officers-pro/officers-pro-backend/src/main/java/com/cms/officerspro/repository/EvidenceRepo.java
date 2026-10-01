package com.cms.officerspro.repository;

import com.cms.officerspro.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepo extends JpaRepository<Evidence,String> {
    @Query("SELECT e FROM Evidence e WHERE e.victim.victimId = :victimId")
    List<Evidence> findEvidenceByVictimId(@Param("victimId") String victimId);
}
