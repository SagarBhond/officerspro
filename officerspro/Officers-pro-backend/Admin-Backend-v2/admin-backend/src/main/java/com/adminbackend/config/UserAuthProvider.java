package com.adminbackend.config;

import com.adminbackend.dto.UserDto;
import com.adminbackend.entity.Role;
import com.adminbackend.entity.RoleEnum;
import com.adminbackend.entity.User;
import com.adminbackend.service.CustomUserDetailsService;
import com.adminbackend.service.UserService;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor(onConstructor = @__(@Lazy))
public class UserAuthProvider {

    private static final Logger logger = LoggerFactory.getLogger(UserAuthProvider.class);


    @Value("${jwt.secret}")
    private String secretKey;

    private final UserService userService;
    private final CustomUserDetailsService customUserDetailsService;


    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
    }

    public String createToken(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + 3600000);
        UserDto user = userService.findByEmail(email);


        RoleEnum roleName = user.getRole().getName(); // Assuming getName() returns RoleEnum

        return JWT.create()
                .withIssuer(email)
                .withIssuedAt(now)
                .withExpiresAt(validity)
                .withClaim("role", roleName.toString())
                .withClaim("userId", user.getId()) // ✅ Add this line
                .sign(Algorithm.HMAC512(secretKey));
    }

    /*public Authentication validateToken(String token) {
        logger.debug("Validating token: {}", token);
        JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secretKey))
                .build();
        DecodedJWT decoded = verifier.verify(token);
        String email = decoded.getIssuer();
        logger.debug("Token issuer (email): {}", email);
        UserDto user = userService.findByEmail(email);
        if (user == null) {
            logger.warn("No user found for email: {}", email);
        } else {
            logger.debug("User found: {} with role: {}", user.getEmail(), user.getRole().getName());
        }
        Role role = user.getRole();
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        logger.debug("Granted authorities: {}", authorities);
        return new UsernamePasswordAuthenticationToken(user, null, authorities);
    }*/
   /* public Authentication validateToken(String token) {
        logger.debug("Validating token: {}", token);

        JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secretKey)).build();
        DecodedJWT decoded = verifier.verify(token);
        String email = decoded.getIssuer();

        logger.debug("Token issuer (email): {}", email);

        UserDto user = userService.findByEmail(email);
        if (user == null) {
            logger.warn("No user found for email: {}", email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        Role role = user.getRole();
        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role.getName().name()) // 👈 Use .name() if role is Enum
        );

        logger.debug("Granted authorities: {}", authorities);

        // ✅ Use email as the principal
        return new UsernamePasswordAuthenticationToken(email, null, authorities);
    }*/

    public Authentication validateToken(String token) {
        logger.debug("Validating token: {}", token);

        JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secretKey)).build();
        DecodedJWT decoded = verifier.verify(token);
        String email = decoded.getIssuer();

        logger.debug("Token issuer (email): {}", email);

        // ✅ Load full UserDetails including entitlements and roles
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        logger.debug("Authorities from UserDetails: {}", userDetails.getAuthorities());

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }



    public Long extractUserId(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secretKey))
                .build();
        DecodedJWT decoded = verifier.verify(token);
        return decoded.getClaim("userId").asLong();
    }


    public String extractRole(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC512(secretKey))
                .build();
        DecodedJWT decoded = verifier.verify(token);
        return decoded.getClaim("role").asString(); // 👈 "ADMIN", "MANAGER", etc.
    }
}