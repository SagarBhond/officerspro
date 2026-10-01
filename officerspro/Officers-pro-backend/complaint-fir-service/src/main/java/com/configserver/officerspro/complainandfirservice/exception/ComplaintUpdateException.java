package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when there's an error updating a complaint.
 */
public class ComplaintUpdateException extends ComplaintFIRException {

    public ComplaintUpdateException() {
        super("OFSCFS013", "Failed to update complaint");
    }

    public ComplaintUpdateException(String message) {
        super("OFSCFS013", message);
    }
}
