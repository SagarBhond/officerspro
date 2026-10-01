package com.adminbackend.repository;

import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.Module;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EntitlementRepository extends JpaRepository<Entitlement, Long> {
    List<Entitlement> findByUser(User user);


    @Query("SELECT e FROM Entitlement e JOIN FETCH e.module JOIN FETCH e.role WHERE e.user.id = :userId")
    List<Entitlement> findByUserId(@Param("userId") Long userId);

    List<Entitlement> findByCreatedBy(Long createdBy);


    Optional<Entitlement> findByUserAndModule(User user, Module module);

    // ✅ Use this for safe and reliable deletion
    Optional<Entitlement> findByUserIdAndModuleId(Long userId, Long moduleId);
}

