package com.configserver.officerspro.courtcasemanagementservice.dto.request;

import java.time.LocalDate;

public class SummonsRequest {
    private Long recipientId;
    private String recipientType;
    private LocalDate appearanceDate;

    // Default constructor
    public SummonsRequest() {}

    // Getters and Setters
    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public LocalDate getAppearanceDate() {
        return appearanceDate;
    }

    public void setAppearanceDate(LocalDate appearanceDate) {
        this.appearanceDate = appearanceDate;
    }
}
