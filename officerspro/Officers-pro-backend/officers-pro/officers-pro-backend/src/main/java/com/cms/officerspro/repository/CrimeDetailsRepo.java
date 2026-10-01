package com.cms.officerspro.repository;

import com.cms.officerspro.entity.CrimeDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrimeDetailsRepo extends JpaRepository<CrimeDetails,String> {


}
