package com.adminbackend.exception;

public class OfficerAlreadyExistsException extends RuntimeException {
    public OfficerAlreadyExistsException(String message) {
        super(message);
    }
}
