package com.adminbackend.repository;

import com.adminbackend.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
    long countByActiveTrue();
    long countByActiveFalse();

    // ✅ Total Revenue = sum of all ACTIVE plan prices
    @Query("SELECT SUM(p.price) FROM Plan p WHERE p.active = true")
    Double getTotalRevenue();

    // ✅ Expected Revenue = sum of INACTIVE (expired) plan prices
    @Query("SELECT SUM(p.price) FROM Plan p WHERE p.active = false")
    Double getExpectedRevenue();


} 