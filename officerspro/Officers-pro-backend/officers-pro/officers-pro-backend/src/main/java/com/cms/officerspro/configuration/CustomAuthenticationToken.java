package com.cms.officerspro.configuration;

import com.cms.officerspro.service.subscription.SubscriptionService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;

@Slf4j
@Getter
public class CustomAuthenticationToken extends JwtAuthenticationToken {

    private final String email;
    private final String subscriptionStatus;
    private final String subscriptionType;
    private final SubscriptionService subscriptionService;

    public CustomAuthenticationToken(Jwt jwt, Collection<? extends GrantedAuthority> authorities, String name,
                                     String subscriptionStatus, String subscriptionType, SubscriptionService subscriptionService) {
        super(jwt, authorities, name);
        this.email = name;
        this.subscriptionStatus = subscriptionStatus;
        this.subscriptionType = subscriptionType;
        this.subscriptionService = subscriptionService;



        setAuthenticated(true);
    }
}