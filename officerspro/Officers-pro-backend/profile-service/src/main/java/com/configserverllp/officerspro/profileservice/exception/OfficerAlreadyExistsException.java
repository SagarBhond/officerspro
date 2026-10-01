package com.configserverllp.officerspro.profileservice.exception;

public class OfficerAlreadyExistsException extends RuntimeException {
    
    public OfficerAlreadyExistsException(String message) {
        super(message);
    }
}
