package com.configserver.officerspro.courtcasemanagementservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "ERR_CASE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<?> handleInvalidInput(InvalidInputException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "ERR_INVALID_INPUT", ex.getMessage());
    }

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<?> handleServiceError(ServiceException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_INTERNAL_SERVER", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_INTERNAL_SERVER", "Unexpected error occurred");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String code, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("code", code);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
