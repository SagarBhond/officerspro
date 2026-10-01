package com.configserverllp.officerspro.documentmanagementservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
//import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;
import java.time.Duration;
import java.net.URL;
import java.net.URI;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.io.IOException;
import java.util.UUID;

/**
 * Service for handling S3 file operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;


    @Value("${aws.s3.bucket-name:officers-pro}")
    private String bucketName;

    @Value("${aws.s3.folder:officers-pro-documents/}")
    private String folderName;

    @Value("${aws.region:ap-south-1}")
    private String region;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    /**
     * Upload file to S3 and return the public URL
     */
    public String uploadFile(MultipartFile file, String linkedTo, String linkId) throws IOException {
        // Generate unique file name to avoid conflicts
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = generateUniqueFileName(linkedTo, linkId, fileExtension);
        
        String s3Key = folderName + uniqueFileName;
        
        log.info("📤 Uploading file to S3: {} -> {}/{}", originalFileName, bucketName, s3Key);
        
        // Upload to S3
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(file.getContentType())
                .build();
        
        s3Client.putObject(putObjectRequest, 
                RequestBody.fromBytes(file.getBytes()));
        
        // Generate S3 URL
        String s3Url = String.format("https://%s.s3.%s.amazonaws.com/%s", 
                bucketName, region, s3Key);
        
        log.info("✅ File uploaded successfully to S3: {}", s3Url);
        
        return s3Key;
    }
    
    /**
     * Download file bytes from S3 based on stored file path or raw key
     */
    public byte[] downloadFile(String filePath) throws IOException {
        String objectKey = extractObjectKey(filePath);
        log.info("📥 Downloading file from S3: bucket={}, key={}", bucketName, objectKey);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        try (ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest)) {
            return s3Object.readAllBytes();
        } catch (NoSuchKeyException e) {
            log.error("❌ File not found in S3: {}", objectKey);
            throw new IOException("File not found in storage", e);
        } catch (Exception e) {
            log.error("❌ Failed to download file from S3: {}", e.getMessage(), e);
            throw new IOException("Failed to download file from S3", e);
        }
    }
    
    /**
     * Generate unique file name with context
     */
    private String generateUniqueFileName(String linkedTo, String linkId, String fileExtension) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomId = UUID.randomUUID().toString().substring(0, 8);
        
        if (linkId != null && !linkId.trim().isEmpty()) {
            return String.format("%s_%s_%s_%s%s", 
                    linkedTo.toLowerCase(), 
                    linkId, 
                    timestamp, 
                    randomId, 
                    fileExtension);
        } else {
            return String.format("%s_%s_%s%s", 
                    linkedTo.toLowerCase(), 
                    timestamp, 
                    randomId, 
                    fileExtension);
        }
    }
    
    /**
     * Extract file extension from file name
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * Extract S3 object key from file path or URL.
     */
    private String extractObjectKey(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("filePath cannot be null or empty");
        }

        String normalizedPath = filePath.trim();

        if (normalizedPath.startsWith("https://")) {
            String hostPrefix = String.format("https://%s.s3.%s.amazonaws.com/", bucketName, region);
            if (normalizedPath.startsWith(hostPrefix)) {
                return normalizedPath.substring(hostPrefix.length());
            }

            int lastSlashIndex = normalizedPath.lastIndexOf("/");
            if (lastSlashIndex >= 0 && lastSlashIndex + 1 < normalizedPath.length()) {
                String potentialKey = normalizedPath.substring(lastSlashIndex + 1);
                return ensureFolderPrefix(potentialKey);
            }
        }

        if (normalizedPath.startsWith("/")) {
            normalizedPath = normalizedPath.substring(1);
        }

        return ensureFolderPrefix(normalizedPath);
    }

    private String ensureFolderPrefix(String key) {
        if (key.startsWith(folderName)) {
            return key;
        }
        return folderName + key;
    }
    public String generatePresignedUrl(String objectKey) {


        S3Presigner.Builder presignerBuilder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        accessKeyId.trim(),
                                        secretAccessKey.trim()
                                )
                        )
                )
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        if (endpoint != null && !endpoint.isBlank()) {
            presignerBuilder.endpointOverride(URI.create(endpoint.trim()));
        }
        S3Presigner presigner = presignerBuilder.build();


        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(30))
                .getObjectRequest(getObjectRequest)
                .build();

        URL signedUrl = presigner.presignGetObject(presignRequest).url();
        presigner.close();

        return signedUrl.toString();
    }

}
