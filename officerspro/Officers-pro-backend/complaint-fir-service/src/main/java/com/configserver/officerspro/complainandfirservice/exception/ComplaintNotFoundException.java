package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when a complaint is not found.
 */
public class ComplaintNotFoundException extends ComplaintFIRException {

    public ComplaintNotFoundException() {
        super("OFSCFS001", "Complaint not found");
    }

    public ComplaintNotFoundException(String message) {
        super("OFSCFS001", message);
    }
}
