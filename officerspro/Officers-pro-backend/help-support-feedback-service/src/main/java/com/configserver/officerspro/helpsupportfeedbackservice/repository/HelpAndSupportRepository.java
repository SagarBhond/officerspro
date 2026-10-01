package com.configserver.officerspro.helpsupportfeedbackservice.repository;

import com.configserver.officerspro.helpsupportfeedbackservice.entity.HelpAndSupport;
import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpAndSupportRepository extends JpaRepository<HelpAndSupport, Integer> {

    // Find all tickets raised by a specific user
    List<HelpAndSupport> findByRaisedByUserId(Integer userId);

    // Find all tickets assigned to a specific user
    List<HelpAndSupport> findByAssignedTo(Integer userId);

    // Find all tickets by status
    List<HelpAndSupport> findByStatus(TicketStatus status);

    // Find all tickets by status (paginated)
    Page<HelpAndSupport> findByStatus(TicketStatus status, Pageable pageable);

    // Find tickets raised by user with specific status
    List<HelpAndSupport> findByRaisedByUserIdAndStatus(Integer userId, TicketStatus status);

    // Count tickets by status
    @Query("SELECT COUNT(t) FROM HelpAndSupport t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);

    // Count all open tickets
    @Query("SELECT COUNT(t) FROM HelpAndSupport t WHERE t.status = 'OPEN' OR t.status = 'IN_PROGRESS'")
    long countOpenTickets();

    // Find tickets by subject containing keyword
    @Query("SELECT t FROM HelpAndSupport t WHERE LOWER(t.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<HelpAndSupport> findBySubjectContaining(@Param("keyword") String keyword);

    // Get all tickets ordered by created date
    List<HelpAndSupport> findAllByOrderByCreatedOnDesc();

    // Paginated tickets
    Page<HelpAndSupport> findAllByOrderByCreatedOnDesc(Pageable pageable);
}
