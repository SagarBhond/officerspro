package com.cms.officerspro.repository;

import com.cms.officerspro.entity.Ferrist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FerristRepo extends JpaRepository<Ferrist,String> {

    @Query(value="SELECT * FROM cms.ferrist f WHERE f.ferrist_list_victim_id = :victimId",nativeQuery = true)
    List<Ferrist> findByVictimId(@Param("victimId") String victimId);
}