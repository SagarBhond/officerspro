package com.cms.officerspro.configuration;

import com.cms.officerspro.constants.Constants;
import com.cms.officerspro.service.subscription.SubscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Component
@SuppressWarnings("unchecked")
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    private final KeycloakConfig keycloakConfig;
    private final SubscriptionService subscriptionService;

    public JwtAuthConverter(KeycloakConfig keycloakConfig, SubscriptionService subscriptionService) {
        this.keycloakConfig = keycloakConfig;
        this.subscriptionService = subscriptionService;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        log.info("Converting JWT to Authentication Token");
        Collection<GrantedAuthority> jwtAuthorities = jwtGrantedAuthoritiesConverter.convert(jwt);
        Collection<GrantedAuthority> customAuthorities = (Collection<GrantedAuthority>) extractRole(jwt);

        Collection<GrantedAuthority> authorities = Stream.concat(
                        jwtAuthorities.stream(), customAuthorities.stream())
                .collect(Collectors.toSet());

        String subscriptionStatus = jwt.getClaim("subscriptionStatus");
        String subscriptionType = jwt.getClaim("subscriptionType");
        String principalName = getPrincipalName(jwt);

        if (subscriptionStatus == null || subscriptionType == null) {
            log.error("Missing subscription information in JWT");
            throw new JwtException("Subscription data is missing in the JWT.");
        }

        if (!subscriptionService.isSubscriptionValid(principalName) && subscriptionStatus.equals(Constants.ACTIVE_STATUS)) {
            log.error("Subscription is not valid for user: {}", principalName);
            throw new JwtException("Subscription is not valid.");
        }

        return new JwtAuthenticationToken(jwt, authorities, principalName);
    }

    private String getPrincipalName(Jwt jwt) {
        String name = JwtClaimNames.SUB;
        if (keycloakConfig.getPrincipalAttribute() != null) {
            name = keycloakConfig.getPrincipalAttribute();
        }
        return jwt.getClaim(name);
    }

    private Collection<? extends GrantedAuthority> extractRole(Jwt jwt) {
        log.info("Extracting roles from JWT");
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");

        if (resourceAccess == null) {
            log.error("No resource access found in JWT");
            return Collections.emptySet();
        }

        Map<String, Object> resource = (Map<String, Object>) resourceAccess.get(keycloakConfig.getFrontendClientId());
        if (resource == null) {
            log.error("No resource found for client ID: {}", keycloakConfig.getFrontendClientId());
            return Collections.emptySet();
        }

        Collection<String> resourceRoles = (Collection<String>) resource.get("roles");
        if (resourceRoles == null) {
            return Collections.emptySet();
        }

        return resourceRoles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }
}
