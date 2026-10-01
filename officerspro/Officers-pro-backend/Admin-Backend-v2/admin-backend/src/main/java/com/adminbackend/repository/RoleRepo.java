package com.adminbackend.repository;

import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepo extends JpaRepository<Role,Integer> {

    Optional<Role> findByName(RoleEnum name);

    // ✅ Add this to get the role of a user by their userId
   // @Query("SELECT u.role FROM User u WHERE u.id = :userId")
    //Optional<Role> findRoleByUserId(@Param("userId") Long userId);
}

