package com.cms.officerspro.service;

import com.cms.officerspro.configuration.KeycloakConfig;
import com.cms.officerspro.entity.KeycloakUserRegistrationRequest;
import com.cms.officerspro.repository.KeycloakUserRegistrationRepository;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class KeycloakService {

    @Autowired
    private Keycloak keycloak;

    @Autowired
    private EmailService emailService;

    @Autowired
    private KeycloakConfig keycloakConfig;

    @Autowired
    private KeycloakUserRegistrationRepository keycloakUserRegistrationRepository;

    public boolean registerUserOnKeycloak(KeycloakUserRegistrationRequest user) {
        log.info("Starting registration for user on Keycloak: {}", user.getEmail());

        UserRepresentation userRepresentation = createUserRepresentation(user);
        UsersResource usersResource = getUsersResource();

        Response response = usersResource.create(userRepresentation);

        if (response.getStatus() == 201) {
            String userId = usersResource.searchByEmail(user.getEmail(), true).get(0).getId();
            user.setKeycloakUserId(userId);
            keycloakUserRegistrationRepository.save(user);
            assignUserRole(user);
            try {
                usersResource.get(userId).sendVerifyEmail();
                log.info("Verification email sent to user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send verification email for user {}: {}", user.getEmail(), e.getMessage());
            }

            emailService.sendEmail(user);
            return true;
        } else {
            log.error("User registration failed with status: {}. Response: {}", response.getStatus(), response.readEntity(String.class));
            return false;
        }
    }

    private UserRepresentation createUserRepresentation(KeycloakUserRegistrationRequest user) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setFirstName(user.getFirstName());
        userRepresentation.setLastName(user.getLastName());
        userRepresentation.setUsername(user.getEmail());
        userRepresentation.setEmail(user.getEmail());
        userRepresentation.setEnabled(true);

        String generatedPassword = generateRandomPassword();
        user.setPassword(generatedPassword);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(generatedPassword);

        userRepresentation.setCredentials(Collections.singletonList(credential));

        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("subscriptionStatus", Collections.singletonList(user.getSubscriptionStatus()));
        attributes.put("subscriptionType", Collections.singletonList(user.getSubscriptionType()));

        userRepresentation.setAttributes(attributes);

        try {
            keycloakUserRegistrationRepository.save(user);
            return userRepresentation;
        } catch (Exception e) {
            log.error("Error occurred while saving Keycloak user info into database: {}", e.getMessage());
            throw new RuntimeException("Error saving Keycloak user info.");
        }
    }

    private String generateRandomPassword() {
        int length = 8;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            password.append(chars.charAt(index));
        }
        return password.toString();
    }

    private UsersResource getUsersResource() {
        RealmResource realmResource = keycloak.realm(keycloakConfig.getRealm());
        return realmResource.users();
    }

    private void assignUserRole(KeycloakUserRegistrationRequest user) {
        log.info("Assigning role to user ID: {}", user.getKeycloakUserId());
        UserResource userResource = getUsersResource().get(user.getKeycloakUserId());
        RolesResource rolesResource = keycloak.realm(keycloakConfig.getRealm()).roles();

        List<RoleRepresentation> roles = rolesResource.list();
        RoleRepresentation representation = roles.stream()
                .filter(role -> role.getName().equals("realm_user"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Role 'realm_user' not found"));

        userResource.roles().realmLevel().add(Collections.singletonList(representation));
        log.info("Role 'realm_user' assigned to user ID: {}", user.getKeycloakUserId());
    }

    public Boolean enableOrDisableOfficer(String email, boolean status) {
        UsersResource usersResource = getUsersResource();

        try {
            List<UserRepresentation> users = usersResource.searchByEmail(email, true);
            if (users.isEmpty()) {
                log.warn("User not found for email: {}", email);
                return false;
            }

            UserRepresentation userRepresentation = users.get(0);
            userRepresentation.setEnabled(status);

            KeycloakUserRegistrationRequest keycloakUser = keycloakUserRegistrationRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with " + email + " in database"));

            keycloakUser.setUserStatus(status);
            keycloakUserRegistrationRepository.save(keycloakUser);

            usersResource.get(userRepresentation.getId()).update(userRepresentation);
            return true;
        } catch (Exception e) {
            log.error("Error occurred while updating Keycloak user status for email {}: {}", email, e.getMessage());
            return false;
        }
    }

    public Map<String, String> getOfficersCredentials(Set<String> officerEmails) {
        List<KeycloakUserRegistrationRequest> users = keycloakUserRegistrationRepository.findAllByEmailIn(officerEmails);

        return users.stream()
                .collect(Collectors.toMap(
                        KeycloakUserRegistrationRequest::getEmail,
                        KeycloakUserRegistrationRequest::getPassword
                ));
    }
}