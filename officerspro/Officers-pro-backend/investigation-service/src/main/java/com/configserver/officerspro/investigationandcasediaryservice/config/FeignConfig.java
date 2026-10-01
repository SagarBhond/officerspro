package com.configserver.officerspro.investigationandcasediaryservice.config;

import feign.Logger;
import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Feign configuration for the Investigation & Case Diary service.
 *
 * This configuration registers:
 * - A FULL feign logger (useful for debugging outgoing requests)
 * - A SpringFormEncoder so multipart/form-data requests (files + parts)
 *   are encoded correctly when using OpenFeign with feign-form-spring.
 *
 * Note: the project must include the feign-form / feign-form-spring
 * dependencies in the POM to enable the SpringFormEncoder.
 */
@Configuration
public class FeignConfig {

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    @Bean
    public Encoder feignFormEncoder(ObjectFactory<HttpMessageConverters> messageConverters) {
        return new SpringFormEncoder(new SpringEncoder(messageConverters));
    }
}
