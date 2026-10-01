package com.configserver.officerspro.helpsupportfeedbackservice.service;

import com.configserver.officerspro.helpsupportfeedbackservice.client.OfficerResponseDTO;
import com.configserver.officerspro.helpsupportfeedbackservice.client.ProfileClient;
import com.configserver.officerspro.helpsupportfeedbackservice.dto.*;
import com.configserver.officerspro.helpsupportfeedbackservice.entity.HelpAndSupport;
import com.configserver.officerspro.helpsupportfeedbackservice.entity.HelpAndSupportComment;
import com.configserver.officerspro.helpsupportfeedbackservice.entity.SupportRating;
import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import com.configserver.officerspro.helpsupportfeedbackservice.repository.*;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HelpAndSupportService {

    private final HelpAndSupportRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;
    private final AuditTrailRepository auditTrailRepository;
    private final ProfileClient profileClient;

    @Transactional
    public HelpAndSupportResponseDTO createTicket(HelpAndSupportRequestDTO request) {
        log.info("Creating new ticket for user: {}", request.getRaisedByUserId());
        
        HelpAndSupport ticket = HelpAndSupport.builder()
            .raisedByUserId(request.getRaisedByUserId())
            .officerUuid(request.getOfficerUuid())
            .assignedTo(request.getAssignedTo())
            .assignedBy(request.getAssignedBy())
            .status(request.getStatus() != null ? request.getStatus() : TicketStatus.OPEN)
            .subject(request.getSubject())
            .description(request.getDescription())
            .createdBy(request.getCreatedBy())
            .attachmentDocumentId(request.getAttachmentDocumentId())
            .build();
        
        ticket = ticketRepository.save(ticket);
        log.info("Ticket created with ID: {}", ticket.getTicketId());
        
        return mapToResponseDTO(ticket);
    }

    public HelpAndSupportResponseDTO getTicketById(Integer ticketId) {
        log.info("Fetching ticket with ID: {}", ticketId);
        HelpAndSupport ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));
        return mapToResponseDTO(ticket);
    }

    public List<HelpAndSupportResponseDTO> getAllTickets() {
        log.info("Fetching all tickets");
        return ticketRepository.findAllByOrderByCreatedOnDesc().stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public Page<HelpAndSupportResponseDTO> getAllTicketsPaginated(Pageable pageable) {
        log.info("Fetching paginated tickets");
        return ticketRepository.findAllByOrderByCreatedOnDesc(pageable)
            .map(this::mapToResponseDTO);
    }

    public List<HelpAndSupportResponseDTO> getTicketsByStatus(TicketStatus status) {
        log.info("Fetching tickets with status: {}", status);
        return ticketRepository.findByStatus(status).stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    public List<HelpAndSupportResponseDTO> getTicketsByUser(Integer userId) {
        log.info("Fetching tickets for user: {}", userId);
        return ticketRepository.findByRaisedByUserId(userId).stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public HelpAndSupportResponseDTO updateTicket(Integer ticketId, HelpAndSupportRequestDTO request) {
        log.info("Updating ticket with ID: {}", ticketId);
        
        HelpAndSupport ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));
        
        if (request.getSubject() != null) ticket.setSubject(request.getSubject());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getAssignedTo() != null) ticket.setAssignedTo(request.getAssignedTo());
        if (request.getAssignedBy() != null) ticket.setAssignedBy(request.getAssignedBy());
        if (request.getAttachmentDocumentId() != null) ticket.setAttachmentDocumentId(request.getAttachmentDocumentId());
        
        ticket.setUpdatedBy(request.getCreatedBy());
        ticket.setUpdatedOn(LocalDateTime.now());
        
        ticket = ticketRepository.save(ticket);
        log.info("Ticket updated successfully");
        
        return mapToResponseDTO(ticket);
    }

    @Transactional
    public HelpAndSupportResponseDTO resolveTicket(Integer ticketId, String resolution, String status) {
        log.info("Resolving ticket with ID: {} with resolution: {}", ticketId, resolution);
        
        HelpAndSupport ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + ticketId));
        
        // Update ticket status to RESOLVED
        if (status != null && status.equalsIgnoreCase("RESOLVED")) {
            ticket.setStatus(TicketStatus.RESOLVED);
        }
        
        ticket.setUpdatedOn(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);
        log.info("Ticket status updated to resolved");
        
        // Add resolution as a comment
        if (resolution != null && !resolution.trim().isEmpty()) {
            HelpAndSupportComment resolutionComment = HelpAndSupportComment.builder()
                .ticketId(ticketId)
                .commentedBy(null) // Admin/System comment
                .message("Resolution: " + resolution)
                .build();
            
            commentRepository.save(resolutionComment);
            log.info("Resolution comment added to ticket");
        }
        
        return mapToResponseDTO(ticket);
    }

    @Transactional
    public void deleteTicket(Integer ticketId) {
        log.info("Deleting ticket with ID: {}", ticketId);
        ticketRepository.deleteById(ticketId);
        log.info("Ticket deleted successfully");
    }

    @Transactional
    public CommentResponseDTO addComment(CommentRequestDTO request) {
        log.info("Adding comment to ticket: {}", request.getTicketId());
        
        HelpAndSupportComment comment = HelpAndSupportComment.builder()
            .ticketId(request.getTicketId())
            .commentedBy(request.getCommentedBy())
            .message(request.getMessage())
            .attachmentDocumentId(request.getAttachmentDocumentId())
            .createdBy(request.getCreatedBy())
            .build();
        
        comment = commentRepository.save(comment);
        log.info("Comment added with ID: {}", comment.getCommentId());
        
        return mapCommentToDTO(comment);
    }

    public List<CommentResponseDTO> getCommentsByTicket(Integer ticketId) {
        log.info("Fetching comments for ticket: {}", ticketId);
        return commentRepository.findByTicketIdOrderByCreatedOnDesc(ticketId).stream()
            .map(this::mapCommentToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public RatingResponseDTO addRating(RatingRequestDTO request) {
        log.info("Adding rating to ticket: {}", request.getTicketId());
        
        SupportRating rating = SupportRating.builder()
            .ticketId(request.getTicketId())
            .ratedBy(request.getRatedBy())
            .officerUuid(request.getOfficerUuid())
            .score(request.getScore())
            .feedback(request.getFeedback())
            .createdBy(request.getCreatedBy())
            .build();
        
        rating = ratingRepository.save(rating);
        log.info("Rating added with ID: {}", rating.getRatingId());
        
        return mapRatingToDTO(rating);
    }

    public List<RatingResponseDTO> getRatingsByTicket(Integer ticketId) {
        log.info("Fetching ratings for ticket: {}", ticketId);
        return ratingRepository.findByTicketIdOrderByCreatedOnDesc(ticketId).stream()
            .map(this::mapRatingToDTO)
            .collect(Collectors.toList());
    }

    public Double getAverageRating(Integer ticketId) {
        log.info("Calculating average rating for ticket: {}", ticketId);
        Double avg = ratingRepository.calculateAverageRating(ticketId);
        return avg != null ? avg : 0.0;
    }

    public long getOpenTicketsCount() {
        return ticketRepository.countOpenTickets();
    }

    public long getTicketCountByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }

    /**
     * Get all feedback/ratings (for admin dashboard)
     */
    public List<RatingResponseDTO> getAllFeedback() {
        log.info("Fetching all feedback/ratings");
        return ratingRepository.findAllByOrderByCreatedOnDesc().stream()
            .map(this::mapRatingToDTO)
            .collect(Collectors.toList());
    }

    private HelpAndSupportResponseDTO mapToResponseDTO(HelpAndSupport ticket) {
        List<CommentResponseDTO> comments = commentRepository.findByTicketIdOrderByCreatedOnDesc(ticket.getTicketId())
            .stream().map(this::mapCommentToDTO).collect(Collectors.toList());
        
        List<RatingResponseDTO> ratings = ratingRepository.findByTicketIdOrderByCreatedOnDesc(ticket.getTicketId())
            .stream().map(this::mapRatingToDTO).collect(Collectors.toList());
        
        // Fetch officer name from profile service
        String raisedByUserName = null;
        if (ticket.getRaisedByUserId() != null) {
            try {
                // Try using the actual UUID first if available
                String officerIdToFetch = ticket.getOfficerUuid() != null && !ticket.getOfficerUuid().isEmpty() 
                    ? ticket.getOfficerUuid() 
                    : String.valueOf(ticket.getRaisedByUserId());
                
                OfficerResponseDTO officer = profileClient.getOfficerById(officerIdToFetch).getBody();
                if (officer != null) {
                    raisedByUserName = officer.getOfficerName();
                }
            } catch (FeignException.NotFound e) {
                log.warn("Officer not found with ID: {} (UUID: {})", ticket.getRaisedByUserId(), ticket.getOfficerUuid());
            } catch (FeignException e) {
                log.warn("Failed to fetch officer details for ID: {} (UUID: {}) - Status: {}", ticket.getRaisedByUserId(), ticket.getOfficerUuid(), e.status(), e);
            } catch (Exception e) {
                log.warn("Failed to fetch officer details for ID: {} (UUID: {})", ticket.getRaisedByUserId(), ticket.getOfficerUuid(), e);
            }
        }
        
        return HelpAndSupportResponseDTO.builder()
            .ticketId(ticket.getTicketId())
            .raisedByUserId(ticket.getRaisedByUserId())
            .raisedByUserName(raisedByUserName)
            .assignedTo(ticket.getAssignedTo())
            .assignedBy(ticket.getAssignedBy())
            .status(ticket.getStatus())
            .subject(ticket.getSubject())
            .description(ticket.getDescription())
            .createdBy(ticket.getCreatedBy())
            .createdOn(ticket.getCreatedOn())
            .updatedBy(ticket.getUpdatedBy())
            .updatedOn(ticket.getUpdatedOn())
            .comments(comments)
            .ratings(ratings)
            .totalComments(comments.size())
            .averageRating(ratingRepository.calculateAverageRating(ticket.getTicketId()))
            .attachmentDocumentId(ticket.getAttachmentDocumentId())
            .build();
    }

    private CommentResponseDTO mapCommentToDTO(HelpAndSupportComment comment) {
        // Fetch commenter name from profile service
        String commentedByName = null;
        if (comment.getCommentedBy() != null) {
            try {
                OfficerResponseDTO officer = profileClient.getOfficerById(String.valueOf(comment.getCommentedBy())).getBody();
                if (officer != null) {
                    commentedByName = officer.getOfficerName();
                }
            } catch (FeignException.NotFound e) {
                log.warn("Officer not found with ID: {} (commenter)", comment.getCommentedBy());
            } catch (FeignException e) {
                log.warn("Failed to fetch officer details for commenter ID: {} - Status: {}", comment.getCommentedBy(), e.status(), e);
            } catch (Exception e) {
                log.warn("Failed to fetch officer details for commenter ID: {}", comment.getCommentedBy(), e);
            }
        }
        
        return CommentResponseDTO.builder()
            .commentId(comment.getCommentId())
            .ticketId(comment.getTicketId())
            .commentedBy(comment.getCommentedBy())
            .commentedByName(commentedByName)
            .message(comment.getMessage())
            .attachmentDocumentId(comment.getAttachmentDocumentId())
            .createdOn(comment.getCreatedOn())
            .updatedOn(comment.getUpdatedOn())
            .build();
    }

    private RatingResponseDTO mapRatingToDTO(SupportRating rating) {
        // Fetch rater name from profile service
        String ratedByName = null;
        if (rating.getRatedBy() != null) {
            try {
                // Try using the actual UUID first if available
                String officerIdToFetch = rating.getOfficerUuid() != null && !rating.getOfficerUuid().isEmpty() 
                    ? rating.getOfficerUuid() 
                    : String.valueOf(rating.getRatedBy());
                
                OfficerResponseDTO officer = profileClient.getOfficerById(officerIdToFetch).getBody();
                if (officer != null) {
                    ratedByName = officer.getOfficerName();
                }
            } catch (FeignException.NotFound e) {
                log.warn("Officer not found with ID: {} (UUID: {}) (rater)", rating.getRatedBy(), rating.getOfficerUuid());
            } catch (FeignException e) {
                log.warn("Failed to fetch officer details for rater ID: {} (UUID: {}) - Status: {}", rating.getRatedBy(), rating.getOfficerUuid(), e.status(), e);
            } catch (Exception e) {
                log.warn("Failed to fetch officer details for rater ID: {} (UUID: {})", rating.getRatedBy(), rating.getOfficerUuid(), e);
            }
        }
        
        return RatingResponseDTO.builder()
            .ratingId(rating.getRatingId())
            .ticketId(rating.getTicketId())
            .ratedBy(rating.getRatedBy())
            .ratedByName(ratedByName)
            .score(rating.getScore())
            .feedback(rating.getFeedback())
            .createdOn(rating.getCreatedOn())
            .build();
    }
}
