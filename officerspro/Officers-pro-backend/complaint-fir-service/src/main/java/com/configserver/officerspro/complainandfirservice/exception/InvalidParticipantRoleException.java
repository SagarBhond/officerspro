package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when an invalid participant role is specified in a complaint.
 */
public class InvalidParticipantRoleException extends ComplaintFIRException {

    public InvalidParticipantRoleException() {
        super("OFSCFS015", "Invalid participant role specified in complaint");
    }

    public InvalidParticipantRoleException(String message) {
        super("OFSCFS015", message);
    }
}
