package com.cms.officerspro.repository;

import com.cms.officerspro.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerRepo extends JpaRepository<Officer,String> {

    Optional<Officer> findByOfficerEmail(String officerEmail);

}
