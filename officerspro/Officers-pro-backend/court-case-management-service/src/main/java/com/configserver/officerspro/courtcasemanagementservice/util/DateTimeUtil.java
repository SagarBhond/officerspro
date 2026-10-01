package com.configserver.officerspro.courtcasemanagementservice.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimeUtil() {
        // Prevent instantiation
    }

    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }

    public static LocalDateTime parse(String dateTime) {
        return dateTime != null ? LocalDateTime.parse(dateTime, DATE_TIME_FORMATTER) : null;
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
}
