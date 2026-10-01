package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when complaint content is empty or missing.
 */
public class ComplaintNoContentException extends ComplaintFIRException {

    public ComplaintNoContentException() {
        super("OFSCFS010", "Complaint content is empty or missing");
    }

    public ComplaintNoContentException(String message) {
        super("OFSCFS010", message);
    }
}
