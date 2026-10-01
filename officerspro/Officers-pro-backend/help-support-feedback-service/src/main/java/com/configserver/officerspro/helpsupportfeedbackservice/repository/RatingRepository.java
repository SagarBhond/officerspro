package com.configserver.officerspro.helpsupportfeedbackservice.repository;

import com.configserver.officerspro.helpsupportfeedbackservice.entity.SupportRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<SupportRating, Integer> {

    // Find all ratings for a specific ticket
    List<SupportRating> findByTicketIdOrderByCreatedOnDesc(Integer ticketId);

    // Find rating by a specific user for a ticket
    Optional<SupportRating> findByTicketIdAndRatedBy(Integer ticketId, Integer userId);

    // Calculate average rating for a ticket
    @Query("SELECT AVG(r.score) FROM SupportRating r WHERE r.ticketId = :ticketId")
    Double calculateAverageRating(@Param("ticketId") Integer ticketId);

    // Count ratings for a ticket
    long countByTicketId(Integer ticketId);

    // Find all ratings ordered by creation date (for feedback list)
    List<SupportRating> findAllByOrderByCreatedOnDesc();
}
