package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when there's an error creating an FIR.
 */
public class FIRCreationException extends ComplaintFIRException {

    public FIRCreationException() {
        super("OFSCFS005", "Failed to create FIR");
    }

    public FIRCreationException(String message) {
        super("OFSCFS005", message);
    }
}
