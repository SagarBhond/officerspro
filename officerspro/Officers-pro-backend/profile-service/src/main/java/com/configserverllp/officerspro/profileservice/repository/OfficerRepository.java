package com.configserverllp.officerspro.profileservice.repository;

import com.configserverllp.officerspro.profileservice.entity.Officer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, String> {

    /**
     * Find officer by email (encrypted field)
     */
    Optional<Officer> findByOfficerEmail(String officerEmail);

    /**
     * Check if officer exists by email
     */
    boolean existsByOfficerEmail(String officerEmail);

    /**
     * Find all officers with pagination
     */
    Page<Officer> findAll(Pageable pageable);

    /**
     * Find officers by status with pagination
     */
    Page<Officer> findByOfficerStatus(boolean status, Pageable pageable);

    /**
     * Find officers by station (encrypted field) with pagination
     */
    Page<Officer> findByOfficerStation(String station, Pageable pageable);

    /**
     * Find officers by post (encrypted field) with pagination
     */
    Page<Officer> findByOfficerPost(String post, Pageable pageable);

    /**
     * Find officers by status and station with pagination
     */
    Page<Officer> findByOfficerStatusAndOfficerStation(boolean status, String station, Pageable pageable);

    /**
     * Find officers by status and post with pagination
     */
    Page<Officer> findByOfficerStatusAndOfficerPost(boolean status, String post, Pageable pageable);

    /**
     * Custom query to search by name (encrypted field - note: encryption may limit search effectiveness)
     */
    @Query("SELECT o FROM Officer o WHERE o.officerName LIKE %:name%")
    Page<Officer> searchByOfficerName(@Param("name") String name, Pageable pageable);

    /**
     * Find officers by admin email
     */
    Page<Officer> findByAdminEmail(String adminEmail, Pageable pageable);

    /**
     * Find officers by admin email and status
     */
    Page<Officer> findByAdminEmailAndOfficerStatus(String adminEmail, boolean status, Pageable pageable);
}
