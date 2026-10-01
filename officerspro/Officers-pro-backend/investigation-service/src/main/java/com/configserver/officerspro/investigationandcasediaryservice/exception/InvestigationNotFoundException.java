package com.configserver.officerspro.investigationandcasediaryservice.exception;

public class InvestigationNotFoundException extends RuntimeException {
    public InvestigationNotFoundException(String message) {
        super(message);
    }
}
