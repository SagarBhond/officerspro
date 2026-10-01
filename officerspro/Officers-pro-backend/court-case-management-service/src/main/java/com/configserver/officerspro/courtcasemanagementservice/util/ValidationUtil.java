package com.configserver.officerspro.courtcasemanagementservice.util;

import org.springframework.util.StringUtils;

public class ValidationUtil {

    private ValidationUtil() {
        // Prevent instantiation
    }

    public static boolean isValidString(String value) {
        return StringUtils.hasText(value);
    }

    public static void requireNonNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " must not be null");
        }
    }

    public static void requireValidString(String value, String fieldName) {
        if (!isValidString(value)) {
            throw new IllegalArgumentException(fieldName + " must not be empty");
        }
    }
}
