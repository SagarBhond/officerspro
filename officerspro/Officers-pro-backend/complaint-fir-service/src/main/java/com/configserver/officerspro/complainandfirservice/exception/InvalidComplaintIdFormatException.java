package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when complaint ID format is invalid.
 */
public class InvalidComplaintIdFormatException extends ComplaintFIRException {

    public InvalidComplaintIdFormatException() {
        super("OFSCFS007", "Invalid complaint ID format");
    }

    public InvalidComplaintIdFormatException(String message) {
        super("OFSCFS007", message);
    }
}
