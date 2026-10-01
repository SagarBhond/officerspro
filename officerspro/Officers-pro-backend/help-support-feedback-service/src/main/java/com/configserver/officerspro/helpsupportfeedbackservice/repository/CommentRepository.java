package com.configserver.officerspro.helpsupportfeedbackservice.repository;

import com.configserver.officerspro.helpsupportfeedbackservice.entity.HelpAndSupportComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<HelpAndSupportComment, Integer> {

    // Find all comments for a specific ticket
    List<HelpAndSupportComment> findByTicketIdOrderByCreatedOnDesc(Integer ticketId);

    // Count comments for a specific ticket
    long countByTicketId(Integer ticketId);

    // Find comments by a specific user
    List<HelpAndSupportComment> findByCommentedByOrderByCreatedOnDesc(Integer userId);
}
