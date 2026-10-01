package com.configserverllp.officerspro.documentmanagementservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import java.net.URI;

/**
 * Configuration for AWS S3 client
 */
@Configuration
public class S3Config {

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.region:ap-south-1}")
    private String region;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        // Trim credentials to remove any leading/trailing whitespace
        String trimmedAccessKey = accessKeyId != null ? accessKeyId.trim() : "";
        String trimmedSecretKey = secretAccessKey != null ? secretAccessKey.trim() : "";
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(trimmedAccessKey, trimmedSecretKey);
        
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region.trim()))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint.trim()));
        }
        return builder.build();
    }
}
