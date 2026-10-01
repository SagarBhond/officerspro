package com.adminbackend.repository;

import com.adminbackend.entity.Entitlement;
import com.adminbackend.entity.User;
import com.adminbackend.entity.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 🔍 Find a user by email
    Optional<User> findByEmail(String email);

    // ❌ Custom delete by user ID (if needed for cascade behavior)
    @Modifying
    @Query("DELETE FROM User u WHERE u.id = :userId")
    void deleteRolesByUserId(@Param("userId") Long userId);

    // ✅ All Managers
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'MANAGER'")
    List<User> findAllManagers();

    // ✅ All Users (excluding Admins)
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'USER'")
    List<User> findAllUsers();

    @Query("SELECT e FROM Entitlement e WHERE e.user.id = :userId")
    List<Entitlement> findEntitlementsByUserId(@Param("userId") Long userId);


    // 📊 Count users by any role using RoleEnum
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
    int countByRole(@Param("roleName") RoleEnum roleName);
}
