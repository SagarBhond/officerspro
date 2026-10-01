package com.configserver.officerspro.complainandfirservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Standard API response wrapper for error responses.
 * Used for Swagger documentation of error response formats.
 */
@Schema(description = "Standard error response format")
public class ApiErrorResponse {

    @Schema(description = "Timestamp when the error occurred", example = "2024-01-01T12:00:00")
    private LocalDateTime timestamp;

    @Schema(description = "Specific error code for the error type", example = "OFSCFS001")
    private String errorCode;

    @Schema(description = "Human-readable error message", example = "Complaint not found with ID: 123")
    private String message;

    @Schema(description = "HTTP status code", example = "404")
    private Integer status;

    @Schema(description = "Request path that caused the error", example = "/api/victim/statements/123")
    private String path;

    // Default constructor
    public ApiErrorResponse() {}

    // Constructor with all fields
    public ApiErrorResponse(LocalDateTime timestamp, String errorCode, String message, Integer status, String path) {
        this.timestamp = timestamp;
        this.errorCode = errorCode;
        this.message = message;
        this.status = status;
        this.path = path;
    }

    // Getters and setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
