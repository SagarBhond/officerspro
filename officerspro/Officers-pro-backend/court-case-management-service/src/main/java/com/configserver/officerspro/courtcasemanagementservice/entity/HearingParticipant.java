package com.configserver.officerspro.courtcasemanagementservice.entity;

import com.configserver.officerspro.courtcasemanagementservice.enums.ParticipantRole;
import jakarta.persistence.*;

@Entity
@Table(name = "hearing_participant")
public class HearingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long participantId;
    
    private String name;

    @Enumerated(EnumType.STRING)
    private ParticipantRole role;

    @ManyToOne
    @JoinColumn(name = "hearing_id", nullable = false)
    private CourtHearing courtHearing;

    // Default constructor
    public HearingParticipant() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ParticipantRole getRole() {
        return role;
    }

    public void setRole(ParticipantRole role) {
        this.role = role;
    }

    public CourtHearing getCourtHearing() {
        return courtHearing;
    }

    public void setCourtHearing(CourtHearing courtHearing) {
        this.courtHearing = courtHearing;
    }
}
