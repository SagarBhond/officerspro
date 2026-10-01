package com.configserver.chargesheet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class S3MockService {

    @Value("${external.s3.bucket:mock-bucket}")
    private String bucket;

    @Value("${external.s3.local-dir:./uploaded-s3}")
    private String localDir;

    public String upload(byte[] bytes, String key) throws IOException {
        // Default to a unique file name if none provided
        String fileName = (key != null && !key.trim().isEmpty()) ? key : UUID.randomUUID() + ".pdf";

        // Ensure nested directories exist (e.g. uploaded-s3/chargesheet/)
        Path fullPath = Paths.get(localDir, fileName).toAbsolutePath();
        Files.createDirectories(fullPath.getParent());  // ✅ creates all parent folders if missing

        System.out.println("Uploading file to: " + fullPath); // debug log

        try (FileOutputStream fos = new FileOutputStream(fullPath.toFile())) {
            fos.write(bytes);
        }

        return "file://" + fullPath;
    }
}
