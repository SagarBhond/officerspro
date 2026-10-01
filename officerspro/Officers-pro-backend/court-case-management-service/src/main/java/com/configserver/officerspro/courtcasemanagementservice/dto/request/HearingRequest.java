package com.configserver.officerspro.courtcasemanagementservice.dto.request;

import java.time.LocalDateTime;

public class HearingRequest {
    private LocalDateTime scheduledAt;
    private String venue;

    // Default constructor
    public HearingRequest() {}

    // Getters and Setters
    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }
}
