package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.FIRWitness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FIRWitnessRepository extends JpaRepository<FIRWitness, Integer> {

    List<FIRWitness> findByFir_FirId(String firId);

    void deleteByFir_FirId(String firId);
}
