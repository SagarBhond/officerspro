package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when there's an error saving a complaint.
 */
public class ComplaintSaveException extends ComplaintFIRException {

    public ComplaintSaveException() {
        super("OFSCFS002", "Failed to save complaint");
    }

    public ComplaintSaveException(String message) {
        super("OFSCFS002", message);
    }
}
