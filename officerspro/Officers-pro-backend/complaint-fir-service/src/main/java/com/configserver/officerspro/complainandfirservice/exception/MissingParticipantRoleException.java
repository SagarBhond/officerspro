package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when a required participant role is missing.
 */
public class MissingParticipantRoleException extends ComplaintFIRException {

    public MissingParticipantRoleException() {
        super("OFSCFS004", "Missing required participant role");
    }

    public MissingParticipantRoleException(String message) {
        super("OFSCFS004", message);
    }
}
