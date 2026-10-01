package com.configserver.officerspro.helpsupportfeedbackservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Integer ratingId;

    @Column(name = "ticket_id", nullable = false)
    private Integer ticketId;

    @Column(name = "rated_by", nullable = false)
    private Integer ratedBy; // FK → CMS.User (Officer rating it)

    @Column(name = "officer_uuid", length = 255)
    private String officerUuid; // Actual officer UUID for fetching officer details from profile service

    @Column(name = "score", nullable = false)
    private Integer score; // 1-5 rating

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback; // Optional remarks

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "created_on", nullable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @PrePersist
    protected void onCreate() {
        createdOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }
}
