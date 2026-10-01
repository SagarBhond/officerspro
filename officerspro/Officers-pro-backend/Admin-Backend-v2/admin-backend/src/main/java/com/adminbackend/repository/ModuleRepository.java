package com.adminbackend.repository;

import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    // Case-insensitive search
    Module findByNameIgnoreCase(String name);

   /* @Query("SELECT e FROM Entitlement e WHERE e.user.id = :userId")
    List<Entitlement> findByUserId(@Param("userId") Long userId);*/

}
