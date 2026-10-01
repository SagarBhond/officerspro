package com.configserver.officerspro.investigationandcasediaryservice.exception;

public class DocumentUploadException extends RuntimeException {
    public DocumentUploadException(String message) {
        super(message);
    }
    
    public DocumentUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
