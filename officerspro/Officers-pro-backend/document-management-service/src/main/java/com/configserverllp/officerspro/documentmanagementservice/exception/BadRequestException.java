package com.configserverllp.officerspro.documentmanagementservice.exception;

/**
 * Thrown when a bad request or invalid input is detected.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
