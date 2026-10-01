package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.FIRVictim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FIRVictimRepository extends JpaRepository<FIRVictim, Integer> {

    List<FIRVictim> findByFirFirId(String firId);

    void deleteByFirFirId(String firId);
}
