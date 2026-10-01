package com.cms.officerspro.repository;

import com.cms.officerspro.entity.KeycloakUserRegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface KeycloakUserRegistrationRepository extends JpaRepository<KeycloakUserRegistrationRequest, Long> {

    Optional<KeycloakUserRegistrationRequest> findByEmail(String email);
    List<KeycloakUserRegistrationRequest> findAllByEmailIn(Set<String> emails);
}
