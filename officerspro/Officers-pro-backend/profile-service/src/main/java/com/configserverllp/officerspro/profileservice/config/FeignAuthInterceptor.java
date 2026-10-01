//package com.configserverllp.officerspro.profileservice.config;
//
//import feign.RequestInterceptor;
//import feign.RequestTemplate;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//
//@Component
//@RequiredArgsConstructor
//public class FeignAuthInterceptor implements RequestInterceptor {
//
//    private final KeycloakAdminTokenProvider tokenProvider;
//
//    @Override
//    public void apply(RequestTemplate template) {
//        String accessToken = tokenProvider.getAccessToken();
//        template.header("Authorization", "Bearer " + accessToken);
//    }
//}
