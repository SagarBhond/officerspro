package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.FIRAccused;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FIRAccusedRepository extends JpaRepository<FIRAccused, Integer> {

    List<FIRAccused> findByFirFirId(String firId);

    void deleteByFirFirId(String firId);
}
