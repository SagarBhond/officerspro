package com.configserverllp.officerspro.documentmanagementservice.exception;

/**
 * Thrown when a document is not found for the given ID.
 */
public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(String message) {
        super(message);
    }
}
