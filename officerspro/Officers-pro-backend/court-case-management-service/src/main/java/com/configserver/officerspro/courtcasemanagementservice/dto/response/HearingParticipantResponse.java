package com.configserver.officerspro.courtcasemanagementservice.dto.response;

import com.configserver.officerspro.courtcasemanagementservice.enums.ParticipantRole;

public class HearingParticipantResponse {
    private Long id;
    private Long participantId;
    private String name;
    private ParticipantRole role;

    public HearingParticipantResponse() {}

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
}
