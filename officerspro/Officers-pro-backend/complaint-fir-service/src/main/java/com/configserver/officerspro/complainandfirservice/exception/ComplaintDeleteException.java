package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when there's an error deleting a complaint.
 */
public class ComplaintDeleteException extends ComplaintFIRException {

    public ComplaintDeleteException() {
        super("OFSCFS014", "Failed to delete complaint");
    }

    public ComplaintDeleteException(String message) {
        super("OFSCFS014", message);
    }
}
