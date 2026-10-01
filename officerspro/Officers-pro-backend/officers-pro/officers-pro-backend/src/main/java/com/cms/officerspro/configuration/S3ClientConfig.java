package com.cms.officerspro.configuration;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3ClientConfig {

    @Value("${cloud.aws.region.static}")
    private String region;

    public AmazonS3 getS3Client() {
        return AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .build();
    }
}
