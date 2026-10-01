package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when attempting to create a duplicate complaint.
 */
public class DuplicateComplaintException extends ComplaintFIRException {

    public DuplicateComplaintException() {
        super("OFSCFS003", "Duplicate complaint detected");
    }

    public DuplicateComplaintException(String message) {
        super("OFSCFS003", message);
    }
}
