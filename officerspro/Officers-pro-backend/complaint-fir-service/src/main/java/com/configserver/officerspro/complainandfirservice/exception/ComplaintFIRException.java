package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Base exception class for all complaint and FIR related exceptions.
 * Extends RuntimeException to provide unchecked exception behavior.
 */
public class ComplaintFIRException extends RuntimeException {

    private final String errorCode;

    public ComplaintFIRException(String message) {
        super(message);
        this.errorCode = "OFSCFS000"; // Default error code
    }

    public ComplaintFIRException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
