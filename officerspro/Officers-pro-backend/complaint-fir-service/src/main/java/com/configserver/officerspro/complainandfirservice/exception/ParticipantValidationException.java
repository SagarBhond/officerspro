package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when participant validation fails.
 */
public class ParticipantValidationException extends ComplaintFIRException {

    public ParticipantValidationException() {
        super("OFSCFS012", "Participant validation failed");
    }

    public ParticipantValidationException(String message) {
        super("OFSCFS012", message);
    }
}
