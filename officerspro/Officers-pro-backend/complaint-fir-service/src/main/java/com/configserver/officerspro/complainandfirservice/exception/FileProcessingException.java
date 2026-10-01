package com.configserver.officerspro.complainandfirservice.exception;

/**
 * Exception thrown when there's an error processing files.
 */
public class FileProcessingException extends ComplaintFIRException {

    public FileProcessingException() {
        super("OFSCFS006", "File processing failed");
    }

    public FileProcessingException(String message) {
        super("OFSCFS006", message);
    }
}
