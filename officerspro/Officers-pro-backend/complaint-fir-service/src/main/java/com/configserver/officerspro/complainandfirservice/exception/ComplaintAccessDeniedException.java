package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when access to a complaint is denied.
 */
public class ComplaintAccessDeniedException extends ComplaintFIRException {

    public ComplaintAccessDeniedException() {
        super("OFSCFS008", "Access to complaint denied");
    }

    public ComplaintAccessDeniedException(String message) {
        super("OFSCFS008", message);
    }
}
