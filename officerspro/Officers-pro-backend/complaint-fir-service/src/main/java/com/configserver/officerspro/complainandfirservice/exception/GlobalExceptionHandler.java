package com.configserver.officerspro.complainandfirservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for complaint and FIR related exceptions.
 * Provides structured JSON responses for all custom exceptions.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles ComplaintNotFoundException
     */
    @ExceptionHandler(ComplaintNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleComplaintNotFoundException(
            ComplaintNotFoundException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    /**
     * Handles FileProcessingException
     */
    @ExceptionHandler(FileProcessingException.class)
    public ResponseEntity<Map<String, Object>> handleFileProcessingException(
            FileProcessingException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    /**
     * Handles ComplaintServiceException (fallback)
     */
    @ExceptionHandler(ComplaintServiceException.class)
    public ResponseEntity<Map<String, Object>> handleComplaintServiceException(
            ComplaintServiceException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    /**
     * Builds a standardized error response structure
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            ComplaintFIRException ex, HttpStatus status, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("errorCode", ex.getErrorCode());
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("status", status.value());
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(errorResponse, status);
    }
}
