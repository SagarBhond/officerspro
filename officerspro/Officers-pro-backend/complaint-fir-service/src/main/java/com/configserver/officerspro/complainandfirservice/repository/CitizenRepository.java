package com.configserver.officerspro.complainandfirservice.repository;

import com.configserver.officerspro.complainandfirservice.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Integer> {
    boolean existsByAadharNo(String aadharNo);
    boolean existsByEmail(String email);
    boolean existsByContactNo(String contactNo);
    Optional<Citizen> findByAadharNo(String aadharNo);
    List<Citizen> findAllByEmail(String email);
    Optional<Citizen> findByContactNo(String contactNo);
    List<Citizen> findAllByContactNo(String contactNo);
}
