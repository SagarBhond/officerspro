package com.cms.officerspro.repository;

import com.cms.officerspro.entity.Witness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WitnessRepo extends JpaRepository<Witness,String> {

    @Query(value="SELECT * FROM witnesses WHERE witness_list_victim_id = :victimId",nativeQuery = true)
    List<Witness> findByVictimId(@Param("victimId") String victimId);
}
