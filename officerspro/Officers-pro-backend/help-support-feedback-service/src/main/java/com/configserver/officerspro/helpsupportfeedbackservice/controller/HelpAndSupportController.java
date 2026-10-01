package com.configserver.officerspro.helpsupportfeedbackservice.controller;

import com.configserver.officerspro.helpsupportfeedbackservice.audit.APIRequestLogRequestDTO;
import com.configserver.officerspro.helpsupportfeedbackservice.audit.HttpMethodType;
import com.configserver.officerspro.helpsupportfeedbackservice.client.AuditClient;
import com.configserver.officerspro.helpsupportfeedbackservice.dto.*;
import com.configserver.officerspro.helpsupportfeedbackservice.enums.TicketStatus;
import com.configserver.officerspro.helpsupportfeedbackservice.service.HelpAndSupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/helpandsupport")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Help & Support Management", description = "APIs for managing support tickets, comments, and ratings")
//@CrossOrigin(origins = "*")
public class HelpAndSupportController {

    private final HelpAndSupportService service;
    private final AuditClient auditClient;

    @PostMapping("/tickets")
    @Operation(summary = "Create new support ticket")
    public ResponseEntity<HelpAndSupportResponseDTO> createTicket(
            @Valid @RequestBody HelpAndSupportRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            HelpAndSupportResponseDTO response = service.createTicket(request);
            logAudit(httpRequest, "/api/support/tickets", HttpMethodType.POST, 201, "Ticket created: " + response.getTicketId(), startTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating ticket", e);
            logAudit(httpRequest, "/api/support/tickets", HttpMethodType.POST, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tickets")
    @Operation(summary = "Get all support tickets")
    public ResponseEntity<List<HelpAndSupportResponseDTO>> getAllTickets(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<HelpAndSupportResponseDTO> response;
            if (page != null && size != null) {
                Pageable pageable = PageRequest.of(page, size);
                Page<HelpAndSupportResponseDTO> pageResponse = service.getAllTicketsPaginated(pageable);
                response = pageResponse.getContent();
            } else {
                response = service.getAllTickets();
            }
            logAudit(httpRequest, "/api/support/tickets", HttpMethodType.GET, 200, response.size() + " tickets", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching tickets", e);
            logAudit(httpRequest, "/api/support/tickets", HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket by ID")
    public ResponseEntity<HelpAndSupportResponseDTO> getTicketById(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            HelpAndSupportResponseDTO response = service.getTicketById(id);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.GET, 200, "Ticket found", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching ticket", e);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.GET, 404, "Not found", startTime);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/tickets/{id}")
    @Operation(summary = "Update ticket")
    public ResponseEntity<HelpAndSupportResponseDTO> updateTicket(
            @PathVariable Integer id,
            @Valid @RequestBody HelpAndSupportRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            HelpAndSupportResponseDTO response = service.updateTicket(id, request);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.PUT, 200, "Ticket updated", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating ticket", e);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.PUT, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/tickets/{id}/resolve")
    @Operation(summary = "Resolve ticket with admin response")
    public ResponseEntity<HelpAndSupportResponseDTO> resolveTicket(
            @PathVariable Integer id,
            @RequestBody Map<String, String> resolveRequest,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            String resolution = resolveRequest.get("resolution");
            String status = resolveRequest.get("status");
            
            HelpAndSupportResponseDTO response = service.resolveTicket(id, resolution, status);
            logAudit(httpRequest, "/api/support/tickets/" + id + "/resolve", HttpMethodType.PUT, 200, "Ticket resolved", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error resolving ticket", e);
            logAudit(httpRequest, "/api/support/tickets/" + id + "/resolve", HttpMethodType.PUT, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/tickets/{id}")
    @Operation(summary = "Delete ticket")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            service.deleteTicket(id);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.DELETE, 204, "Ticket deleted", startTime);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting ticket", e);
            logAudit(httpRequest, "/api/support/tickets/" + id, HttpMethodType.DELETE, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tickets/status/{status}")
    @Operation(summary = "Get tickets by status")
    public ResponseEntity<List<HelpAndSupportResponseDTO>> getTicketsByStatus(
            @PathVariable TicketStatus status,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<HelpAndSupportResponseDTO> response = service.getTicketsByStatus(status);
            logAudit(httpRequest, "/api/support/tickets/status/" + status, HttpMethodType.GET, 200, response.size() + " tickets", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching tickets by status", e);
            logAudit(httpRequest, "/api/support/tickets/status/" + status, HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tickets/user/{userId}")
    @Operation(summary = "Get tickets by user")
    public ResponseEntity<List<HelpAndSupportResponseDTO>> getTicketsByUser(
            @PathVariable Integer userId,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<HelpAndSupportResponseDTO> response = service.getTicketsByUser(userId);
            logAudit(httpRequest, "/api/support/tickets/user/" + userId, HttpMethodType.GET, 200, response.size() + " tickets", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching tickets by user", e);
            logAudit(httpRequest, "/api/support/tickets/user/" + userId, HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/comments")
    @Operation(summary = "Add comment to ticket")
    public ResponseEntity<CommentResponseDTO> addComment(
            @Valid @RequestBody CommentRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            CommentResponseDTO response = service.addComment(request);
            logAudit(httpRequest, "/api/support/comments", HttpMethodType.POST, 201, "Comment added", startTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error adding comment", e);
            logAudit(httpRequest, "/api/support/comments", HttpMethodType.POST, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/comments/ticket/{ticketId}")
    @Operation(summary = "Get comments by ticket")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByTicket(
            @PathVariable Integer ticketId,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<CommentResponseDTO> response = service.getCommentsByTicket(ticketId);
            logAudit(httpRequest, "/api/support/comments/ticket/" + ticketId, HttpMethodType.GET, 200, response.size() + " comments", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching comments", e);
            logAudit(httpRequest, "/api/support/comments/ticket/" + ticketId, HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/api/victim/feedback")
    @Operation(summary = "Submit victim feedback for officer")
    public ResponseEntity<RatingResponseDTO> submitVictimFeedback(
            @Valid @RequestBody FeedbackRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            // Convert feedback request to rating request
            RatingRequestDTO ratingRequest = new RatingRequestDTO();
            ratingRequest.setTicketId(1); // Default ticket ID for general feedback
            ratingRequest.setScore(request.getRating());
            ratingRequest.setFeedback(request.getFeedbackDesc());
            ratingRequest.setRatedBy(request.getOfficerId());
            ratingRequest.setCreatedBy(request.getOfficerId());
            
            RatingResponseDTO response = service.addRating(ratingRequest);
            logAudit(httpRequest, "/api/victim/feedback", HttpMethodType.POST, 201, "Victim feedback submitted", startTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error submitting victim feedback", e);
            logAudit(httpRequest, "/api/victim/feedback", HttpMethodType.POST, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/feedback")
    @Operation(summary = "Submit feedback for officer")
    public ResponseEntity<RatingResponseDTO> submitFeedback(
            @Valid @RequestBody FeedbackRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            // Convert feedback request to rating request
            RatingRequestDTO ratingRequest = new RatingRequestDTO();
            ratingRequest.setTicketId(1); // Default ticket ID for general feedback
            ratingRequest.setScore(request.getRating());
            ratingRequest.setFeedback(request.getFeedbackDesc());
            ratingRequest.setRatedBy(request.getOfficerId());
            ratingRequest.setCreatedBy(request.getOfficerId());
            
            RatingResponseDTO response = service.addRating(ratingRequest);
            logAudit(httpRequest, "/api/support/feedback", HttpMethodType.POST, 201, "Feedback submitted", startTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error submitting feedback", e);
            logAudit(httpRequest, "/api/support/feedback", HttpMethodType.POST, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/ratings")
    @Operation(summary = "Add rating to ticket")
    public ResponseEntity<RatingResponseDTO> addRating(
            @Valid @RequestBody RatingRequestDTO request,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            RatingResponseDTO response = service.addRating(request);
            logAudit(httpRequest, "/api/support/ratings", HttpMethodType.POST, 201, "Rating added", startTime);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error adding rating", e);
            logAudit(httpRequest, "/api/support/ratings", HttpMethodType.POST, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/ratings/ticket/{ticketId}")
    @Operation(summary = "Get ratings by ticket")
    public ResponseEntity<List<RatingResponseDTO>> getRatingsByTicket(
            @PathVariable Integer ticketId,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<RatingResponseDTO> response = service.getRatingsByTicket(ticketId);
            logAudit(httpRequest, "/api/support/ratings/ticket/" + ticketId, HttpMethodType.GET, 200, response.size() + " ratings", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching ratings", e);
            logAudit(httpRequest, "/api/support/ratings/ticket/" + ticketId, HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/ratings/average/{ticketId}")
    @Operation(summary = "Get average rating for ticket")
    public ResponseEntity<Double> getAverageRating(
            @PathVariable Integer ticketId,
            HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            Double response = service.getAverageRating(ticketId);
            logAudit(httpRequest, "/api/support/ratings/average/" + ticketId, HttpMethodType.GET, 200, "Average: " + response, startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error calculating average rating", e);
            logAudit(httpRequest, "/api/support/ratings/average/" + ticketId, HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/feedback/all")
    @Operation(summary = "Get all feedback/ratings for admin dashboard")
    public ResponseEntity<List<RatingResponseDTO>> getAllFeedback(HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            List<RatingResponseDTO> response = service.getAllFeedback();
            logAudit(httpRequest, "/api/helpandsupport/feedback/all", HttpMethodType.GET, 200, response.size() + " feedback entries", startTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all feedback", e);
            logAudit(httpRequest, "/api/helpandsupport/feedback/all", HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/stats/open")
    @Operation(summary = "Get count of open tickets")
    public ResponseEntity<Long> getOpenTicketsCount(HttpServletRequest httpRequest) {
        long startTime = System.currentTimeMillis();
        try {
            Long count = service.getOpenTicketsCount();
            logAudit(httpRequest, "/api/support/stats/open", HttpMethodType.GET, 200, "Count: " + count, startTime);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error fetching open tickets count", e);
            logAudit(httpRequest, "/api/support/stats/open", HttpMethodType.GET, 500, "Error: " + e.getMessage(), startTime);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void logAudit(HttpServletRequest request, String endpoint, HttpMethodType method, int responseCode, String responseBody, long startTime) {
        try {
            long executionTime = System.currentTimeMillis() - startTime;
            String ipAddress = getClientIP(request);
            
            APIRequestLogRequestDTO auditLog = APIRequestLogRequestDTO.builder()
                .userId(null)
                .endpointUrl(endpoint)
                .httpMethod(method)
                .ipAddress(ipAddress)
                .macAddress(null)
                .requestBody(null)
                .responseCode(responseCode)
                .responseBody(responseBody)
                .executionTimeMs(executionTime)
                .build();
            
            auditClient.logAPIRequest(auditLog);
        } catch (Exception e) {
            log.error("Failed to send audit log: {}", e.getMessage());
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
