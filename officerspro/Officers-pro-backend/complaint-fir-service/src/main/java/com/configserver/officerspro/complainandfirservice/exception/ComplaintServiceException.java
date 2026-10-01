package com.configserver.officerspro.complainandfirservice.exception;

/**
 * General service exception for complaint and FIR operations.
 * Used as fallback when specific exception type is not found.
 */
public class ComplaintServiceException extends ComplaintFIRException {

    public ComplaintServiceException() {
        super("OFSCFS009", "Complaint service operation failed");
    }

    public ComplaintServiceException(String message) {
        super("OFSCFS009", message);
    }
}
