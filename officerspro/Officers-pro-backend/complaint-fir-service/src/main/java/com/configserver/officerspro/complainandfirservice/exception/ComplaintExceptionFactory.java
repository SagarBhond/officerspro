package com.configserver.officerspro.complainandfirservice.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Factory class for creating complaint and FIR related exceptions.
 * Maps specific error codes to exception classes using a static map.
 */
public class ComplaintExceptionFactory {

    private static final Map<String, Supplier<ComplaintFIRException>> EXCEPTION_MAP = new HashMap<>();

    static {
        EXCEPTION_MAP.put("OFSCFS001", ComplaintNotFoundException::new);
        EXCEPTION_MAP.put("OFSCFS006", FileProcessingException::new);
        EXCEPTION_MAP.put("OFSCFS009", ComplaintServiceException::new);
    }

    /**
     * Creates an exception instance based on the provided error code.
     * Falls back to ComplaintServiceException if the code is not found.
     *
     * @param code The error code to map to an exception
     * @return A new instance of the corresponding exception
     */
    public static ComplaintFIRException create(String code) {
        return EXCEPTION_MAP.getOrDefault(code, ComplaintServiceException::new).get();
    }

    /**
     * Creates an exception with a custom message.
     *
     * @param code The error code
     * @param message The custom error message
     * @return A new exception instance with the custom message
     */
    public static ComplaintFIRException create(String code, String message) {
        Supplier<ComplaintFIRException> supplier = EXCEPTION_MAP.get(code);
        if (supplier != null) {
            ComplaintFIRException exception = supplier.get();
            // Create a new exception with the custom message while preserving the error code
            return new ComplaintFIRException(exception.getErrorCode(), message) {};
        }
        return new ComplaintServiceException(message);
    }
}
